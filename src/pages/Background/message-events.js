import { onMessageFromContentScript, onMessageFromPopup, MessageLocation } from '@wbet/message-api';
import { EVENTS } from '../../common';

// 监听来自content script 的触发事件
onMessageFromContentScript(MessageLocation.Background, {
  [EVENTS.OPEN_HOME]: () => {
    chrome.tabs.create(
      {
        active: true,
        url: 'https://nicegoodthings.com/'
      },
      null
    );
  },
  [EVENTS.LOGIN]: (request, sender) => {
    chrome.tabs.create(
      {
        openerTabId: sender.tab.id,
        active: true,
        url: `Login/index.html?tid=${sender.tab.id}`
      },
      null
    );
  },
});
onMessageFromPopup(MessageLocation.Background, {
  [EVENTS.LOGIN]: () => {
    chrome.tabs.create(
      {
        active: true,
        url: `Login/index.html`
      },
      null
    );
  },
});
