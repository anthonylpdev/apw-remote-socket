export default class {

  constructor() {
    this.subscribers = new Map();
  }

  subscribe(chan, callback) {
    let subs = this.subscribers.has(chan) ? this.subscribers.get(chan) : [];
    subs.push(callback);
    this.subscribers.set(chan, subs);
  }

  publish(chan, data) {
    let subs = this.subscribers.has(chan) ? this.subscribers.get(chan) : [];
    subs.forEach(callback => callback(data));
  }

  unsubscribe(chan, callback) {
    if (!this.subscribers.has(chan)) return;
    let subs = this.subscribers.get(chan);
    subs = subs.filter(theCallback => theCallback != callback);
    this.subscribers.set(chan, subs);
  }

}