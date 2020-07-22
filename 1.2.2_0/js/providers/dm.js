const DMProvider = class extends AbstractProvider {
  search() {
      const a = this.getIdFromLocation();
      a && !this.ids[a] && (this.addVideo(a),
      this.renderBtn(".Player__player___wX05I", a))
  }
  getIdFromLocation() {
      return /^\/\w{0,2}$/.test(location.pathname) ? null : location.pathname.replace("/video/", "")
  }
  getVideoData(a, b) {
      chrome.runtime.sendMessage({
          action: "ajaxGet",
          url: "https://www.dailymotion.com/video/" + a
      }, c=>{
          const d = this.getVideoDataFromHTML(c)
            , e = d.map(b=>(b.vid = a,
          b.provider = "dm",
          b));
          b(e)
      }
      )
  }
  getVideoDataFromHTML(a) {
      if (!a)
          return void console.warn("!str for parsing");
      const b = "};"
        , c = a.indexOf("var __PLAYER_CONFIG__ = {")
        , d = a.indexOf(b, c)
        , e = a.substr(c + 25 - 1, d - c - 25 + b.length)
        , f = JSON.parse(e)
        , g = f.metadata.title
        , h = [];
      return ["720@60", "480", "380"].forEach(a=>{
          const b = this.getUrlFromConfig(f, a);
          b && h.push({
              title: g,
              url: b,
              quality: a
          })
      }
      ),
      h
  }
  getUrlFromConfig(a, b) {
      const c = a.metadata.qualities[b];
      if (c) {
          const a = c.find(a=>"video/mp4" === a.type);
          return a ? a.url : null
      }
  }
}
;
