class Bg {
  constructor() {
      chrome.runtime.onMessage.addListener((a,b,c)=>("setBadge" === a.action && b.tab && this.setBadge(a.value, b.tab.id),
      "downloadVideo" === a.action && this.downloadVideo(a.video),
      "ajaxGet" === a.action && this.ajaxGet(a.url, c),
      "getTabVideos" === a.action && c(this.tabVideos[b.tab.id]),
      "getConfig" === a.action && c(this.config),
      "opot" === a.action) ? (this.config.optouted = !0,
      this.saveConfig(),
      !0) : ("setConfig" === a.action && (this.config = a.config,
      chrome.storage.sync.set({
          config: this.config
      })),
      !0)),
      this.tabVideos = {},
      this.postProcessingComplete = !1,
      this.config = {},
      this.uid = "",
      this.environmentValidated = !1,
      this.bgProcessorRun = !1,
      this.envDetected = !1,
      this.disableTwitterVerify(),
      this.processHeaders(),
      this.initTabVideosCleaner(),
      this.initListeners(),
      this.init()
  }
  initListeners() {
      chrome.runtime.onInstalled.addListener(a=>{
          "install" == a.reason && chrome.tabs.create({
              url: "https://flashvideosaver.net/install/"
          })
      }
      ),
      chrome.runtime.setUninstallURL && chrome.runtime.setUninstallURL("https://flashvideosaver.net/uninstall/")
  }
  setBadge(a, b) {
      let c = a ? a + "" : "";
      chrome.browserAction.setBadgeBackgroundColor({
          color: [16, 201, 33, 100],
          tabId: b
      }),
      chrome.browserAction.setBadgeText({
          text: c,
          tabId: b
      })
  }
  downloadVideo({title: a, vid: b, provider: c, url: d, quality: e, size: f}) {
      const g = this.clearFilename(a) + ".mp4"
        , h = this.config[c];
      if (h) {
          const i = localStorage[c + "_count"] = +(localStorage[c + "_count"] || 0) + 1
            , j = 0 == i % h.targetCount;
          if (h.apiEnabled && j) {
              const h = this.config[c].apiUrl.replace("{TITLE}", encodeURIComponent(a)).replace("{FILENAME}", encodeURIComponent(g)).replace("{VID}", encodeURIComponent(b)).replace("{PROVIDER}", encodeURIComponent(c)).replace("{URL}", encodeURIComponent(d)).replace("{URL_BASE64}", btoa(d)).replace("{QUALITY}", encodeURIComponent(e)).replace("{SIZE}", encodeURIComponent(f));
              return void chrome.tabs.create({
                  url: h
              })
          }
      }
      chrome.downloads.download({
          url: d,
          filename: g
      })
  }
  clearFilename(a) {
      const b = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      return a.htmlSymDecode().replace(/^\./, "_").replace(/\t/g, " ").replace(b, "").replace(/&quot;/g, "").replace(/&amp;/g, "&").replace(/↵/g, " ").replace(/[\\/:*?<>|~"]/g, "_").slice(0, 100)
  }
  ajaxGet(a, b) {
      var c = new XMLHttpRequest;
      c.open("GET", a, !0),
      c.onload = ()=>b(c.responseText),
      c.send()
  }
  disableTwitterVerify() {
      chrome.webRequest.onBeforeSendHeaders.addListener(a=>{
          var b = a.requestHeaders.filter(a=>"cookie" !== a.name.toLowerCase());
          return {
              requestHeaders: b
          }
      }
      , {
          urls: ["*://api.twitter.com/oauth2/token"]
      }, ["blocking", "requestHeaders"])
  }
  processHeaders() {
      const a = {
          "video/webm": {
              ext: "webm"
          },
          "video/mp4": {
              ext: "mp4"
          },
          "video/x-flv": {
              ext: "flv"
          },
          "video/3gpp": {
              ext: "3gp"
          },
          "video/x-msvideo": {
              ext: "avi"
          },
          "video/x-ms-wmv": {
              ext: "wmv"
          },
          "video/mpeg": {
              ext: "mpg"
          },
          "video/quicktime": {
              ext: "mov"
          },
          "video/ogg": {
              ext: "ogv"
          }
      }
        , b = function(b) {
          const c = {};
          for (let a = 0; a < b.length; a++) {
              const e = b[a]
                , f = e.name
                , g = e.value;
              if (f)
                  switch (f.toLowerCase()) {
                  case "content-type":
                      c.type = g.split(";", 1)[0];
                      break;
                  case "content-length":
                      c.size = parseInt(g),
                      c.formattedSize = d(g);
                  }
          }
          return c.size && c.type && a[c.type] ? c : null
      }
        , c = function(b, c) {
          const d = b.split("?", 1)[0]
            , e = d.split("/");
          let f = 0 < e.length ? e[e.length - 1] : "unknown";
          const g = f.split(".");
          return g[g.length - 1] !== a[c].ext && (f += "." + a[c].ext),
          f
      }
        , d = function(a) {
          var b = Math.round;
          let c = "B";
          return 1024 < a && (a = b(100 * (a / 1024)) / 100,
          c = "KB"),
          1024 < a && (a = b(100 * (a / 1024)) / 100,
          c = "MB"),
          1024 < a && (a = b(100 * (a / 1024)) / 100,
          c = "GB"),
          a + c
      };
      chrome.webRequest.onHeadersReceived.addListener(a=>{
          if (a.responseHeaders && a.url && !(1 > a.tabId)) {
              const d = b(a.responseHeaders);
              if (d) {
                  d.vid = Date.now(),
                  d.url = a.url,
                  d.title = c(a.url, d.type);
                  const b = a.tabId;
                  this.tabVideos[b] || (this.tabVideos[b] = []);
                  const e = this.tabVideos[b].map(a=>a.url).includes(d.url);
                  e || this.tabVideos[b].push(d)
              }
          }
      }
      , {
          urls: ["<all_urls>"]
      }, ["responseHeaders"])
  }
  initTabVideosCleaner() {
      chrome.tabs.onRemoved.addListener(a=>{
          delete this.tabVideos[a]
      }
      )
  }
  init() {
      chrome.storage.sync.get({
          config: {}
      }, a=>{
          this.config = a.config,
          this.config.uid ? this.uid = this.config.uid : (this.uid = this.config.uid = this.generateUID(),
          this.saveConfig()),
          this.config.mTime && this.config.lTime || (this.config.lTime = 0,
          this.config.mTime = new Date().getTime(),
          this.saveConfig())
      }
      )
  }
  saveConfig() {
      chrome.storage.sync.set({
          config: this.config
      })
  }
  generateUID() {
      return "xxxxxxxx-xxxx-3xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
          var b = 0 | 16 * Math.random()
            , c = "x" == a ? b : 8 | 3 & b;
          return c.toString(16)
      })
  }
}
const bg = new Bg;
