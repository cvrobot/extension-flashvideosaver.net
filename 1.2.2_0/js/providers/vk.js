const VKProvider = class extends AbstractProvider {
  search() {
      $("video").not("#vlc-video").not("." + INIT_CLASS).each((a,b)=>{
          const c = this.getVideoIdByHtml(b);
          c && !this.ids[c] && (this.addVideo(c),
          this.renderBtn(b.closest(".video_box_wrap"), c)),
          b.classList.add(INIT_CLASS)
      }
      ),
      $(".page_post_thumb_video[data-video]").not("." + INIT_CLASS).each((a,b)=>{
          const c = $(b).attr("data-video");
          c && !this.ids[c] && (this.addVideo(c),
          this.renderBtn(b, c)),
          b.classList.add(INIT_CLASS)
      }
      )
  }
  getVideoIdByHtml(a) {
      const b = a.closest(".video_box_wrap");
      if (b) {
          const a = b.id.replace("video_box_wrap", "");
          return a ? a : void console.warn("video id not found")
      }
  }
  getVideoData(a, b) {
      $.get("https://vk.com/al_video.php?act=show_inline&al=1&video=" + a, c=>{
          var d, e = /<!json>(.*)/.exec(c);
          if (!e)
              return;
          if (d = e[1],
          d = d.split("<!>")[0],
          d = JSON.parse(d),
          !d)
              return;
          const f = d.player.params[0]
            , g = f.extra_data
            , h = []
            , i = f.md_title;
          if (f.url720 && h.push({
              title: i,
              url: f.url720,
              vid: a,
              provider: "vk",
              quality: "720"
          }),
          f.url480 && h.push({
              title: i,
              url: f.url480,
              vid: a,
              provider: "vk",
              quality: "480"
          }),
          f.url360 && h.push({
              title: i,
              url: f.url360,
              vid: a,
              provider: "vk",
              quality: "360"
          }),
          g && g.includes("instagram")) {
              h.push({
                  title: i,
                  url: "https:" + g,
                  vid: a,
                  provider: "in",
                  quality: "640p"
              })
          } else if (g && /^[a-zA-Z0-9\-_]+$/.test(g))
              ;
          else
              ;b(h)
      }
      )
  }
}
;
