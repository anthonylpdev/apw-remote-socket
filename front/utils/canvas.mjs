let canvasId = 1;

// Minimalist Canvas manager
export default class {

  constructor({draw = () => 0, blur = false, shadowColor = 'black'} = {}) {
    let canvas = document.createElement('canvas');
    canvas.classList.add(`synn-canvas-${canvasId++}`);
    document.body.appendChild(canvas);
    this.ctx = canvas.getContext('2d');
    this.ctx.canvas.width = this.ctx.canvas.clientWidth;
    this.ctx.canvas.height = this.ctx.canvas.clientHeight;
    this.callbackDraw = draw;
    this.blur = blur;
    this.shadowColor = shadowColor;
  }

  getDimension() {
    return {width: this.ctx.canvas.width, height: this.ctx.canvas.height};
  }

  get() {
    return this.ctx.canvas;
  }

  getCtx() {
    return this.ctx;
  }

  setDraw(draw) {
    this.callbackDraw = draw;
  }

  draw() {
    this.callbackDraw(this.ctx);
  }

  redraw() {
    this.ctx.canvas.width = this.ctx.canvas.clientWidth;
    this.ctx.canvas.height = this.ctx.canvas.clientHeight;
    this.ctx.shadowBlur = this.blur;
    this.ctx.shadowColor = this.shadowColor;
    this.draw();
  }

}