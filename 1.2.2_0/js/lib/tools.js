String.prototype.htmlSymDecode = function() {
  const a = document.createElement("div");
  return a.innerHTML = this,
  a.innerText
}
;
