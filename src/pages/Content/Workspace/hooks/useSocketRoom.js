import { useEffect, useState } from 'react';
import { getUser } from './utils';
import emitter, { VeraEvents } from './useEmitter';
import { EVENTS } from '../../../../common'
import { sendMessageToBackground, onMessageFromBackground, MessageLocation } from '@wbet/message-api'

// import { destoryCursor } from '../Cursor';
import { Howl } from 'howler';
let joined = false;
var SoundEnterRoom = new Howl({
  src: [`chrome-extension://${chrome.runtime.id}/assets/sounds/enter.room.mp3`],
  volume: 1,
});
var SoundLeaveRoom = new Howl({
  src: [`chrome-extension://${chrome.runtime.id}/assets/sounds/leave.room.mp3`],
  volume: 1,
});
const useSocketRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [users, setUsers] = useState([]);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [isHost, setIsHost] = useState(true);
  const [peerId, setPeerId] = useState(null);

  useEffect(() => {
    const initUser = async () => {
      let curr = await getUser();
      if (curr) {
        let { id, username, photo } = curr;
        setUser({ uid: id, username, photo });
      } else {
        setUser({ username: 'Guest' });
      }
    };
    initUser();
  }, []);
  useEffect(() => {
    console.log('io init', user, roomId, peerId);
    if (!user || !roomId || !peerId) {
      return;
    }
    // 给background发消息：初始化websocket
    sendMessageToBackground({
      roomId, user, peerId
    }, MessageLocation.Content, EVENTS.ROOM_SOCKET_INIT);
    onMessageFromBackground(MessageLocation.Content, {
      [EVENTS.CURRENT_USERS]: (data) => {
        console.log("current peers", data);
        const { users, host, update } = data;
        setUsers(users);
        // 首次
        if (!update) {
          setIsHost(host);
          if (host) {
            joined = true;
          }
          // 拿到了房间当前人员列表，才算初始化完
          setInitializing(false);
        }
      },
      [EVENTS.USER_ENTER]: (data) => {
        console.log("user enter room", data);
        const { user } = data;
        setUsers((users) => [...users, user]);
      },
      [EVENTS.USER_JOIN_MEETING]: (data) => {
        console.log("new user joined meeting", data);
        const { user } = data;
        // 过滤下
        if (user.peerId && joined) {
          setUsers((users) => [...users, user]);
          emitter.emit(VeraEvents.NEW_PEER, user.peerId);
          SoundEnterRoom.play();
        }
      },
      [EVENTS.UPDATE_USERS]: ({ users }) => {
        setUsers(users);
      },
      [EVENTS.USER_LEAVE]: (data) => {
        const { user } = data;
        setUsers((users) => users.filter((u) => u.peerId !== user.peerId));
        SoundLeaveRoom.play();
      },
    })
    return () => {
      console.log("io disconnect");
      sendMessageToBackground({}, MessageLocation.Content, EVENTS.DISCONNECT_SOCKET);
    };
  }, [roomId, user, peerId]);
  const sendSocketMessage = (data) => {
    sendMessageToBackground({ data }, MessageLocation.Content, EVENTS.SOCKET_MSG);
    joined = true;
  };
  const initializeSocketRoom = ({ roomId, peerId }) => {
    setPeerId(peerId);
    setRoomId(roomId);
  };
  return {
    sendSocketMessage,
    initializing,
    initializeSocketRoom,
    users,
    user,
    isHost
  };
};

export default useSocketRoom;
