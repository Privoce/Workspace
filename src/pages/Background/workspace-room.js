import { io } from "socket.io-client";
import { sendMessageToContentScript, sendMessageToPopup, onMessageFromPopup, onMessageFromContentScript, MessageLocation } from '@wbet/message-api'
import { EVENTS, SOCKET_SERVER_DOMAIN } from '../../common';
import { debounce, getVideoId } from './utils';
const protocolPrefix = SOCKET_SERVER_DOMAIN.indexOf('localhost') > -1 ? 'http://' : 'wss://';
const SOCKET_SERVER_URL = `${protocolPrefix}${SOCKET_SERVER_DOMAIN}`;
const DATA_HUB = {};
const Videos = new Map()
// init user info
chrome.storage.sync.get(['user'], (res) => {
  console.log('local user data', res.user);
  const { user = null } = res;
  if (user) {
    // 只保留需要的字段
    let keeps = ["id", "username", "photo", "token"];
    let tmp = {};
    Object.keys(user).forEach(k => {
      if (keeps.includes(k) && typeof user[k] !== "undefined") {
        tmp[k] = user[k];
      }
    });
    DATA_HUB.loginUser = tmp;
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    console.log({ changes, area });
    if (area == 'sync') {
      const { user } = changes;
      if (user) {
        let { newValue = null } = user || {};
        DATA_HUB.loginUser = newValue;
      }
    }
  });
});
// 向特定tab发消息
const sendMessageToTab = (tid = null, params, actionType = '') => {
  if (tid) {
    sendMessageToContentScript(tid, params, MessageLocation.Background, actionType);
  }
}
// 初始化workspace
// update tabs
const notifyActiveTab = ({ action = "", payload = {} }) => {
  if (!action) return;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    console.log('active tab', { tab, action });
    if (!tab) return;
    switch (action) {
      case EVENTS.UPDATE_USERS: {
        sendMessageToContentScript(tab?.id, { users: DATA_HUB[tab.id].users }, MessageLocation.Background, EVENTS.UPDATE_USERS)
      }
        break;
      case EVENTS.INVITE_LINK: {
        let { landing } = payload;
        landing = landing || tab.url;
        let rid = DATA_HUB[tab.id].roomId;
        let inviteLink = rid ? `https://nicegoodthings.com/transfer/vera/${rid}/${encodeURIComponent(landing)}?extid=${chrome.runtime.id
          }` : ''
        console.log("get link event", rid, landing);
        sendMessageToContentScript(tab?.id, inviteLink, MessageLocation.Background, EVENTS.INVITE_LINK)
      }
        break;
    }
  })
}
// 监听来自popup的触发事件
onMessageFromPopup(MessageLocation.Background, {
  [EVENTS.LOGOUT]: () => {
    delete DATA_HUB?.loginUser;
    chrome.storage.sync.remove(['user', 'fakename']);
  },
  [EVENTS.POP_UP_DATA]: () => {
    console.log("popup event");
    const { loginUser } = DATA_HUB;
    sendMessageToPopup({ user: loginUser }, MessageLocation.Background, EVENTS.POP_UP_DATA)
  },
  [EVENTS.NEW_MEETING]: () => {
    console.log('new meeting');
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (DATA_HUB[tab.id]) return;
      const newRoomId = `${Math.random().toString(36).substring(7)}`;
      DATA_HUB[tab.id] = { roomId: newRoomId, tabId: tab.id };
      sendMessageToContentScript(tab.id, { roomId: newRoomId }, MessageLocation.Background, EVENTS.NEW_MEETING)
    })
  },
})
// 监听来自content script 的触发事件
onMessageFromContentScript(MessageLocation.Background, {
  // new meeting
  [EVENTS.NEW_MEETING]: (req, sender) => {
    const { rid = "" } = req;
    const { id: tabId } = sender.tab;
    console.log('new meeting', tabId, DATA_HUB);
    if (DATA_HUB[tabId]) {
      chrome.tabs.update(tabId, { active: true });
      return
    }
    const newRoomId = rid ? rid : `${Math.random().toString(36).substring(7)}`
    DATA_HUB[tabId] = { roomId: newRoomId, tabId };
    sendMessageToContentScript(tabId, { roomId: newRoomId }, MessageLocation.Background, EVENTS.NEW_MEETING);
  },
  // socket 初始化
  [EVENTS.ROOM_SOCKET_INIT]: (request = {}, sender) => {
    const { id: tabId, url } = sender.tab;
    // 如果已初始化，则不必再次初始化
    if (DATA_HUB[tabId]?.socket) return;
    console.log('init websocket');
    const { roomId, peerId = '', user } = request;
    const socket = io(SOCKET_SERVER_URL, {
      jsonp: false,
      transports: ['websocket'],
      reconnectionAttempts: 8,
      upgrade: false,
      query: { roomId, link: url, temp: true, peerId, ...user }
    });
    console.log('init websocket', socket);
    // 当前room的socket实例
    DATA_HUB[tabId].socket = socket;
    const currTabId = tabId;

    socket.on('connect', () => {
      console.log('ws room io connect', socket.id);
      // notifyActiveTab({ action: EVENTS.INVITE_LINK })
    });
    socket.on('message', (wtf) => {
      console.log('io message', wtf);
    });
    // 房间当前有哪些人 服务器端来判断是否是host
    socket.on(EVENTS.CURRENT_USERS, ({ host = false, users, update = false }) => {
      // 更新到全局变量
      DATA_HUB[tabId].users = users;
      console.log('io current users', users);
      sendMessageToTab(currTabId, { host, users, update }, EVENTS.CURRENT_USERS);
      // 首次
      if (!update) {
        // 立即开始监听房间新加入人员事件
        socket.on(EVENTS.USER_ENTER, (user) => {
          console.log('io join event', user);
          if (user.id === socket.id) return;
          sendMessageToTab(currTabId, { user }, EVENTS.USER_ENTER)
        });
      }
    });
    // 更新user列表
    socket.on(EVENTS.UPDATE_USERS, ({ users }) => {
      console.log('update users', { users, socket });
      // 更新到全局变量
      DATA_HUB[tabId].users = users;
      notifyActiveTab({ action: EVENTS.UPDATE_USERS });
    });
    // url的更新
    socket.on(EVENTS.SYNC_URL, async ({ url }) => {
      console.log('sync url', { url });
      // 种一个标识
      Videos.set(getVideoId(url), true)
      // 发送到vera tab
      sendMessageToTab(tabId, { url }, EVENTS.SYNC_URL)
    });
    // 播放器的状态更新
    socket.on(EVENTS.SYNC_PLAYER, async (payload) => {
      console.log('sync player', { payload });
      // 发送到vera tab
      sendMessageToTab(tabId, payload, EVENTS.SYNC_PLAYER)
    });
    // 离开房间事件
    socket.on(EVENTS.USER_LEAVE, (user) => {
      console.log('io leave user', user);
      sendMessageToTab(currTabId, { user }, EVENTS.USER_LEAVE)
    });
    // 新用户加入
    socket.on(EVENTS.USER_JOIN_MEETING, (user) => {
      console.log('io join event', user);
      if (user.id === socket.id) return;
      sendMessageToTab(currTabId, { user }, EVENTS.USER_JOIN_MEETING)
    });
    // 出错则重连
    socket.on('connect_error', () => {
      console.log('io socket connect error');
      setTimeout(() => {
        socket.connect();
      }, 1000);
    });
  },
  // send socket msg
  [EVENTS.SOCKET_MSG]: (request, sender) => {
    const { data = null } = request;
    const { id } = sender.tab;
    let currSocket = DATA_HUB[id].socket;
    if (data && currSocket) {
      currSocket.send(data);
    }
  },
  // socket 断开
  [EVENTS.DISCONNECT_SOCKET]: (request, sender) => {
    const { id } = sender.tab;
    if (DATA_HUB[id].socket) {
      DATA_HUB[id].socket.disconnect();
      delete DATA_HUB[id];
    }
  },
  [EVENTS.INVITE_LINK]: (request, sender) => {
    notifyActiveTab({ action: EVENTS.INVITE_LINK, payload: { landing: sender.tab.url } })
  },
  [EVENTS.UPDATE_USERS]: () => {
    notifyActiveTab({ action: EVENTS.UPDATE_USERS })
  },
})
// 关闭vera 标签
chrome.tabs.onRemoved.addListener((tabId) => {
  if (DATA_HUB[tabId]?.tabId == tabId) {
    const currSocket = DATA_HUB[tabId]?.socket || null;
    if (currSocket) {
      currSocket.disconnect();
    }
    delete DATA_HUB[tabId]
  }
});
// 监听vera tab
const debounceSyncUrl = debounce((socket, url) => {
  socket.send({ cmd: 'SYNC_URL', payload: { url } });
})
chrome.tabs.onUpdated.addListener((tabId, { status }, { url }) => {
  if (DATA_HUB[tabId]?.tabId == tabId && status == 'complete' && url) {
    const { socket } = DATA_HUB[tabId] || {};
    if (socket) {
      let key = getVideoId(url);
      let fromSync = Videos.get(key);
      console.log("tab updated event", DATA_HUB[tabId], status, url, key, fromSync);
      if (fromSync) {
        // 来自于别人的广播同步
        Videos.delete(key)
      } else {

        debounceSyncUrl(socket, url)
      }
    }
  }
});

