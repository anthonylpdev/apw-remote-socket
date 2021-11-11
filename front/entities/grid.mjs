export default class {

  constructor ({ctx, cellsize, color = '#ccc', padding = 0, mustDrawGrid = false}) {
    this.cellsize = cellsize;
    this.ctx = ctx;
    this.rows = Math.floor(this.ctx.canvas.height / cellsize);
    this.cols = Math.floor(this.ctx.canvas.width / cellsize);
    this.height = this.rows * this.cellsize;
    this.width = this.cols * this.cellsize;
    this.color = color;
    this.padding = padding;
    this.contentSize = this.cellsize - this.padding * 2;
    this.grid = this.getNewMatrix();
    this.mustDrawGrid = mustDrawGrid;
    this.generation = 1;
    if (this.mustDrawGrid) this.genPath();
  }

  getNewMatrix() {
    let matrix = [];
    for (let x = 0; x < this.cols; x++) {
      matrix[x] = [];
      for (let y = 0; y < this.rows; y++) {
        matrix[x][y] = 0;
      }
    }
    return matrix;
  }

  setEntityAt({entity, x = 0, y = 0, grid = this.grid}) {
    grid[x][y] = entity;
  }

  getEntityAt({x = 0, y = 0, grid = this.grid}) {
    return this.isValidPos({x, y}) ? grid[x][y] : null;
  }

  removeEntityAt({x = 0, y = 0, grid = this.grid}) {
    grid[x][y] = 0;
  }

  genPath() {
    this.path = new Path2D();
    for (let row = 0; row <= this.rows; row++) {
      this.path.moveTo(0, row * this.cellsize);
      this.path.lineTo(this.width, row * this.cellsize);
    }
    for (let col = 0; col <= this.cols; col++) {
      this.path.moveTo(col * this.cellsize, 0);
      this.path.lineTo(col * this.cellsize, this.height);
    }
  }

  getPosFromCoord({x = 0, y = 0}) {
    return {x: x * this.cellsize + this.cellsize / 2, y: y * this.cellsize + this.cellsize / 2};
  }

  getCoordFromPos({x = 0, y = 0}) {
    x = Math.floor((x - this.cellsize/2) / this.cellsize);
    y = Math.floor((y - this.cellsize/2) / this.cellsize);
    if (!this.isValidPos({x, y})) return false;
    return {x, y};
  }

  getContentSize() {
    return this.contentSize;
  }

  isValidPos({x, y}) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  rotate(clockwise = true) {
    let newGrid = [];
    for (let y = 0; y < this.rows; y++) newGrid[y] = [];

    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (clockwise) {
          newGrid[this.rows - y - 1][x] = this.grid[x][y];
        } else {
          newGrid[y][this.cols - x - 1] = this.grid[x][y];
        }
      }
    }
    this.grid = newGrid;
    [this.rows, this.cols] = [this.cols, this.rows];
    this.height = this.rows * this.cellsize;
    this.width = this.cols * this.cellsize;
  }

  mirror() {
    let newGrid = this.getNewMatrix();
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        newGrid[x][this.rows - y - 1] = this.grid[x][y];
      }
    }
    this.grid = newGrid;
  }


  update(dt, elapsedTime) {
    for (const col of this.grid) {
      for (const entity of col) {
        if (entity !== 0) {
          entity.update(dt, elapsedTime);
        }
      }
    }
    this.generation++;
  }

  draw(ctx) {
    ctx.setTransform(1, 0, 0, 1, this.cellsize / 4, this.cellsize / 4);
    if (this.mustDrawGrid) this.drawGrid(ctx);
    this.drawEntity(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawEntity(ctx) {
    for (const entity of this) {
      if (entity.particule.draw) entity.particule.draw(ctx);
    }
  }

  drawGrid(ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 0.5;
    ctx.stroke(this.path);
  }

  *entities() {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const particule = this.getEntityAt({x, y});
        if (!particule) continue;
        const pos = this.getPosFromCoord({x, y});
        yield {particule, pos, x, y};
      }
    }
  }

  [Symbol.iterator]() {
    return this.entities();
  }

}