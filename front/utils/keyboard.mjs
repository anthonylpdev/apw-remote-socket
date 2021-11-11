import PubSub from "./pubsub.mjs";

export default class {

  constructor({repeat = false, caseSensitive = false, maxHistory = 10, listenTo = window, useCode = true} = {}) {
    this.options = {repeat, caseSensitive, maxHistory, listenTo, useCode};
    this.pubSub = new PubSub();
    this.keyPressed = new Set();
    this.history = [];
    this.options.listenTo.addEventListener("keydown", e => this._onKeyDown(e));
    this.options.listenTo.addEventListener("keyup", e => this._onKeyUp(e));
  }

  onKey(key, callback) {
    if (!this.options.caseSensitive) key = key.toUpperCase();
    this.pubSub.subscribe(`keyboard:${key}`, callback);
    return () => this.pubSub.unsubscribe(`keyboard:${key}`, handler);
  }

  onKeydown(key, callback) {
    if (!this.options.caseSensitive) key = key.toUpperCase();
    this.pubSub.subscribe(`keyboard:${key}:down`, callback);
    return () => this.pubSub.unsubscribe(`keyboard:${key}:down`, handler);
  }

  onKeyup(key, callback) {
    if (!this.options.caseSensitive) key = key.toUpperCase();
    this.pubSub.subscribe(`keyboard:${key}:up`, callback);
    return () => this.pubSub.unsubscribe(`keyboard:${key}:up`, handler);
  }

  onKeys(...para) {
    let [callback, ...keys] = para.reverse();
    if (!this.options.caseSensitive) keys = keys.map(key => key.toUpperCase());
    let handler = pressedKey => {
      if (!keys.includes(pressedKey)) return;
      if (keys.every(key => this.isKeyDown(key))) {
        callback(this.keyPressed);
      }
    };
    this.pubSub.subscribe('keyboard', handler);
    return () => this.pubSub.unsubscribe('keyboard', handler);
  }

  onCombo(...para) {
    let [callback, ...keys] = para.reverse();
    if (!this.options.caseSensitive) keys = keys.map(key => key.toUpperCase());
    let handler = pressedKey => {
      let len = this.history.length - 1;
      let i = 0;
      while (i < keys.length && this.history[len - i] == keys[i]) i++;
      if (i == keys.length) callback(this.keyPressed);
    };
    this.pubSub.subscribe('keyboard', handler);
    return () => this.pubSub.unsubscribe('keyboard', handler);
  }

  _onKeyDown(event) {
    if (!this.options.repeat && event.repeat) return;
    let key = (this.options.useCode) ? event.code : event.key;
    if (!this.options.caseSensitive) key = key.toUpperCase();
    this.keyPressed.add(key);
    if (this.history.length >= this.options.maxHistory) this.history.shift();
    this.history.push(key);
    this.pubSub.publish('keyboard', key);
    this.pubSub.publish(`keyboard:${key}`, this.keyPressed);
    this.pubSub.publish(`keyboard:${key}:down`, this.keyPressed);
  }

  _onKeyUp(event) {
    let key = (this.options.useCode) ? event.code : event.key;
    if (!this.options.caseSensitive) key = key.toUpperCase();
    this.keyPressed.delete(key);
    this.pubSub.publish(`keyboard:${key}:up`, this.keyPressed);
  }

  isKeyDown(key) {
    if (!this.options.caseSensitive) key = key.toUpperCase();
    return this.keyPressed.has(key);
  }

  isKeysDown(...keys) {
    return keys.every(key => this.isKeyDown(key));
  }

}