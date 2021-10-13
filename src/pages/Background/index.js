
import './message-events';
import './vera-room';
// 安装扩展触发的事件
chrome.runtime.onInstalled.addListener(function (details) {
  const { reason } = details;
  console.log("install reason", reason);
  switch (reason) {
    case 'install': {
      chrome.tabs.query({ url: "*://*/transfer/vera/*" }, function (tabs) {
        console.log('query vera invite tabs', tabs);
        if (tabs || tabs.length !== 0) {
          for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            if (i == 0) {
              chrome.tabs.executeScript(tab.id, {
                file: 'catchInviteId.bundle.js'
              }, () => {
                console.log('catch script executed');
                chrome.tabs.update(tab.id, { active: true });
              });
            } else {
              chrome.tabs.remove(tab.id);
            }
          }
        }
      });
    }
      break;
  }
});
