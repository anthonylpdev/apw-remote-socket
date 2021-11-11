import Grid from '../grid.mjs';


export const cursorsColors = ['#FF6347', '#0074D9', '#3D9970', '#B10DC9', '#D4AF37', '#39CCCC', '#2ECC40' ,'#85144B', 'black', 'red'];

export default class extends Grid {

  drawEntity(ctx) {
    const halfSize = this.contentSize / 2;
    const quarterSize = this.contentSize / 4;

    for (const entity of this) {
      ctx.fillStyle = cursorsColors[entity.particule - 1];
      ctx.fillRect(entity.pos.x - quarterSize, entity.pos.y  - quarterSize, halfSize, halfSize);
    }
  }

}