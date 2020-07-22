const VMProvider = class extends AbstractProvider {
  search() {
      const a = $(".player_container");
      if (a.length) {
          const b = a[0].id.replace("clip_", "");
          b && !this.ids[b] && (this.addVideo(b),
          this.renderBtn(".player_outro_area", b))
      }
  }
  getVideoData(a, b) {
      $.get(`https://player.vimeo.com/video/${a}/config`, c=>{
          const d = $("h1").text()
            , e = c.request.files.progressive
            , f = [];
          ["1080p", "720p", "480p", "360p"].forEach(b=>{
              const c = e.find(a=>a.quality === b);
              c && f.push({
                  title: d,
                  url: c.url,
                  vid: a,
                  provider: "vm",
                  quality: b
              })
          }
          ),
          b(f)
      }
      )
  }
}
;
