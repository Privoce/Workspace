// room id
document.addEventListener('VERA_ROOM_EVENT', function (e) {
  let {
    detail: { rid, wid, user }
  } = e;
  console.log('received', rid, user);
  if (user) {
    chrome.storage.sync.set({ user }, () => {
      // Notify that we saved.
      console.log('user saved', user);
    });
  }
  if (rid) {
    chrome.storage.sync.set({ room_id: rid, window_id: wid }, () => {
      // Notify that we saved.
      console.log('room & window id saved', rid, wid);
    });
  }
});
