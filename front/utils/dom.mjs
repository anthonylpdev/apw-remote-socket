export function domOn(selector, event, callback) {
  domForEach(selector, ele => ele.addEventListener(event, callback));
}

export function domForEach(selector, callback) {
  document.querySelectorAll(selector).forEach(callback);
}