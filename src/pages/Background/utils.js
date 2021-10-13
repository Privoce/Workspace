function debounce(callback, wait = 2000, immediate = false) {
  let timeout = null
  return function () {
    const callNow = immediate && !timeout
    const next = () => callback.apply(this, arguments)
    clearTimeout(timeout)
    timeout = setTimeout(next, wait)
    if (callNow) {
      next()
    }
  }
}

function getActiveTab() {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({
        currentWindow: true,
        active: true,
      }, function (tabs) {
        resolve(tabs[0]);
      })
    } catch (e) {
      reject(e);
    }
  })
}
function getVideoId(url) {
  let res = '';
  if (!url) return res;
  let urlObj = new URL(url);
  switch (urlObj.host) {
    case 'www.youtube.com':
      res = urlObj.searchParams.get('v')
      break;

    default:
      break;
  }
  return res;
}

export { debounce, getActiveTab, getVideoId }
