// youtube
const sc = document.createElement('script');
sc.textContent = `
    function newVideoHandler(videoId){
      const currentVideoId = new URL(location.href).searchParams.get('v');
      if(currentVideoId == videoId) return;
      const newUrl = '/watch?v=' + videoId;
      const htmlNode = document.querySelector('#related a#thumbnail.yt-simple-endpoint');
      console.log({ htmlNode }, htmlNode.data);
      htmlNode.href = newUrl;
      htmlNode.data.commandMetadata.webCommandMetadata.url = newUrl;
      htmlNode.data.watchEndpoint.videoId = videoId;
      htmlNode.click();
    }
    function msgHandler(e){
      if(e.source == window && e.data?.url){
        const url = new URL(e.data.url);
        switch (url.pathname) {
          case '/watch':
            newVideoHandler(url.searchParams.get('v'))
            break;
          default:{
            const linkElement=document.querySelector('.yt-simple-endpoint[href="' + url.pathname + '"]');
            if(linkElement){
              linkElement.click()
            }
          }
            break;
        }
      }
    }
    window.addEventListener("message",msgHandler,false);
`;
(document.head || document.documentElement).appendChild(sc);
sc.remove()
