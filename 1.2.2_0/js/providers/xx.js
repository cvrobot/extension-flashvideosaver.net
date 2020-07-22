const XXProvider = class extends AbstractProvider {
  search() {
      chrome.runtime.sendMessage({
          action: "getTabVideos"
      }, a=>{
          a && a.length !== this.videos.length && (this.videos = a.map(a=>({
              vid: a.vid,
              title: a.title,
              url: a.url,
              provider: "xx",
              quality: a.type
          })),
          this.setBadge())
      }
      )
  }
}
;
