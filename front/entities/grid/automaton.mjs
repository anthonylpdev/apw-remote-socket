import Grid from '../grid.mjs';

export const PARTICULE = {
  wall : 1,
  sand : 2,
  water: 3,
  smoke: 4,
  seed : 5,
  nuke : 6,
  plantedSeed: 51,
  branch1: 52,
  branch1Inert: 53,
  branch2: 54,
  leaf: 55,
  nukeDecay1: 61,
  nukeDecay2: 62,
  nukeDecay3: 63,
}

const particuleColor = new Map();
particuleColor.set(PARTICULE.sand, '#c2b280');
particuleColor.set(PARTICULE.water, '#2389DA');
particuleColor.set(PARTICULE.wall, 'grey');
particuleColor.set(PARTICULE.smoke, '#444');
particuleColor.set(PARTICULE.seed, 'green');
particuleColor.set(PARTICULE.plantedSeed, 'darkgreen');
particuleColor.set(PARTICULE.branch1, '#895E40');
particuleColor.set(PARTICULE.branch1Inert, '#895E40');
particuleColor.set(PARTICULE.branch2, '#ce714d');
particuleColor.set(PARTICULE.leaf, '#018F44');
particuleColor.set(PARTICULE.nuke, '#B02103');
particuleColor.set(PARTICULE.nukeDecay1, '#D03301');
particuleColor.set(PARTICULE.nukeDecay2, '#F77100');
particuleColor.set(PARTICULE.nukeDecay3, '#FAC000');

export default class extends Grid {

  drawEntity(ctx) {
    const halfSize = this.contentSize / 2;
    for (const entity of this) {
      ctx.fillStyle = particuleColor.get(entity.particule);
      ctx.fillRect(entity.pos.x - halfSize, entity.pos.y  - halfSize, this.contentSize, this.contentSize);
    }
  }

  update() {
    // Make a working copy of the grid
    this.copy = this.getNewMatrix();
    for (const entity of this) {
      this.copy[entity.x][entity.y] = entity.particule;
    }
    // smoke update first
    for (const entity of this) {
      if (entity.particule === PARTICULE.smoke) {
        this.update_smoke(entity);
      }
    }
    for (const entity of this) {
      switch (entity.particule) {
        case PARTICULE.sand: this.update_sand(entity); break;
        case PARTICULE.water: this.update_water(entity); break;
        case PARTICULE.seed: this.update_seed(entity); break;
      }
    }
    // nuke update every 4 generations only
    if (this.generation % 4 == 0) {
      for (const entity of this) {
        switch (entity.particule) {
          case PARTICULE.nuke: this.update_nuke(entity, PARTICULE.nukeDecay1); break;
          case PARTICULE.nukeDecay1: this.update_nuke(entity, PARTICULE.nukeDecay2); break;
          case PARTICULE.nukeDecay2: this.update_nuke(entity, PARTICULE.nukeDecay3); break;
          case PARTICULE.nukeDecay3: this.update_nuke(entity, 0); break;
        }
      }
    }
    // Plant update every 50 generations only
    if (this.generation % 50 == 0) {
      for (const entity of this) {
        switch (entity.particule) {
          case PARTICULE.plantedSeed: this.update_plantedSeed(entity); break;
          case PARTICULE.branch1: this.update_branch1(entity); break;
          case PARTICULE.branch2: this.update_branch2(entity); break;
        }
      }
    }

    this.grid = this.copy;
    this.generation++;
  }

  update_nuke(entity, newState) {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const pos = {x: entity.x + x, y: entity.y + y};
        if (this.isValidPos(pos)) {
          this.setEntityAt({entity: newState, ...pos, grid: this.copy});
        }
      }
    }
  }

  update_seed(entity) {
    let nextPos = null;
    const below = this.getEntityAt({x: entity.x, y: entity.y + 1});
    if (below === 0 || below === PARTICULE.water || below === PARTICULE.smoke) {
      nextPos = {x: entity.x, y: entity.y + 1};
    } else {
      this.setEntityAt({entity: PARTICULE.plantedSeed, x: entity.x, y: entity.y, grid: this.copy});
    }
    if (nextPos) {
      this.setEntityAt({entity: entity.particule, x: nextPos.x, y: nextPos.y, grid: this.copy});
      this.removeEntityAt({x: entity.x, y: entity.y, grid: this.copy});
    }
  }

  update_plantedSeed(entity) {
    // if no water near the seed, do nothing
    let left = this.getEntityAt({x: entity.x - 1, y: entity.y});
    let right = this.getEntityAt({x: entity.x + 1, y: entity.y});
    if (left !== PARTICULE.water && right !== PARTICULE.water) return;
    let up = this.getEntityAt({x: entity.x, y: entity.y - 1});
    let upUp = this.getEntityAt({x: entity.x, y: entity.y - 2});
    let upUpUp = this.getEntityAt({x: entity.x, y: entity.y - 3});
    if (up !== 0) return
    this.removeEntityAt({x: entity.x, y: entity.y, grid: this.copy});
    this.setEntityAt({entity: PARTICULE.branch1Inert, x: entity.x, y: entity.y, grid: this.copy});
    this.setEntityAt({entity: PARTICULE.branch1, x: entity.x, y: entity.y - 1, grid: this.copy});
    if (upUp !== 0) return;
    this.setEntityAt({entity: PARTICULE.branch1Inert, x: entity.x, y: entity.y - 1, grid: this.copy});
    this.setEntityAt({entity: PARTICULE.branch1, x: entity.x, y: entity.y - 2, grid: this.copy});
    if (upUpUp !== 0) return;
    this.setEntityAt({entity: PARTICULE.branch1Inert, x: entity.x, y: entity.y - 2, grid: this.copy});
    this.setEntityAt({entity: PARTICULE.branch1, x: entity.x, y: entity.y - 3, grid: this.copy});
  }

  update_branch1(entity) {
    let up = this.getEntityAt({x: entity.x, y: entity.y - 1});
    let upLeft = this.getEntityAt({x: entity.x - 1, y: entity.y - 1});
    let upRight = this.getEntityAt({x: entity.x + 1, y: entity.y - 1});
    if (up !== 0) return
    if (upRight === 0) {
      this.setEntityAt({entity: PARTICULE.branch2, x: entity.x + 1, y: entity.y - 1, grid: this.copy});
    }
    if (upLeft === 0) {
      this.setEntityAt({entity: PARTICULE.branch2, x: entity.x - 1, y: entity.y - 1, grid: this.copy});
    }
  }

  update_branch2(entity) {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const pos = {x: entity.x + x, y: entity.y + y};
        if (this.getEntityAt(pos) === 0) {
          this.setEntityAt({entity: PARTICULE.leaf, ...pos, grid: this.copy});
        }
      }
    }
  }

  update_sand(entity) {
    let nextPos = null;
    let below = this.getEntityAt({x: entity.x, y: entity.y + 1});
    let belowLeft = this.getEntityAt({x: entity.x - 1, y: entity.y + 1});
    let belowRight = this.getEntityAt({x: entity.x + 1, y: entity.y + 1});
    // sand go through water and smoke
    if (below == PARTICULE.water || below == PARTICULE.smoke) below = 0;
    if (belowLeft == PARTICULE.water || belowLeft == PARTICULE.smoke) belowLeft = 0;
    if (belowRight == PARTICULE.water || belowRight == PARTICULE.smoke) belowRight = 0;
    // todo manage wet sand
    if (below === 0) {
      nextPos = {x: entity.x, y: entity.y + 1};
    } else if (belowLeft === 0) {
      nextPos = {x: entity.x - 1, y: entity.y + 1};
    } else if (belowRight === 0) {
      nextPos = {x: entity.x + 1, y: entity.y + 1};
    }
    if (nextPos) {
      this.setEntityAt({entity: entity.particule, x: nextPos.x, y: nextPos.y, grid: this.copy});
      this.removeEntityAt({x: entity.x, y: entity.y, grid: this.copy});
    }
  }

  update_smoke(entity) {
    let nextPos = null;
    let up = this.getEntityAt({x: entity.x, y: entity.y - 1});
    let upLeft = this.getEntityAt({x: entity.x - 1, y: entity.y - 1});
    let upRight = this.getEntityAt({x: entity.x + 1, y: entity.y - 1});
    // Smoke go through water and leaf
    if (up == PARTICULE.water || up == PARTICULE.leaf) up = 0;
    if (upLeft == PARTICULE.water || upLeft == PARTICULE.leaf) upLeft = 0;
    if (upRight == PARTICULE.water || upRight == PARTICULE.leaf) upRight = 0;
    if (up === 0) {
      nextPos = {x: entity.x, y: entity.y - 1};
    } else if (upLeft  === 0) {
      nextPos = {x: entity.x - 1, y: entity.y - 1};
    } else if (upRight  === 0) {
      nextPos = {x: entity.x + 1, y: entity.y - 1};
    }
    if (nextPos) {
      this.removeEntityAt({x: entity.x, y: entity.y, grid: this.copy});
      this.setEntityAt({entity: entity.particule, x: nextPos.x, y: nextPos.y, grid: this.copy});
    }
  }

  update_water(entity) {
    let nextPos = null;
    let below = this.getEntityAt({x: entity.x, y: entity.y + 1});
    let belowLeft = this.getEntityAt({x: entity.x - 1, y: entity.y + 1});
    let belowRight = this.getEntityAt({x: entity.x + 1, y: entity.y + 1});
    let left = this.getEntityAt({x: entity.x - 1, y: entity.y});
    let right = this.getEntityAt({x: entity.x + 1, y: entity.y});

    if (below === 0) {
      nextPos = {x: entity.x, y: entity.y + 1};
    } else if (belowLeft === 0) {
      nextPos = {x: entity.x - 1, y: entity.y + 1};
    } else if (belowRight  === 0) {
      nextPos = {x: entity.x + 1, y: entity.y + 1};
    } else {
      let distHoleRight = this.cols;
      for (let r = entity.x + 1; r < this.cols; r++) {
        const atRight = this.getEntityAt({x: r, y: entity.y});
        if (atRight && atRight!=PARTICULE.water) break;
        const below = this.getEntityAt({x: r, y: entity.y + 1});
        if (below === 0) {
          distHoleRight = r - entity.x;
          break;
        }
      }
      let distHoleLeft = this.cols;
      for (let l = entity.x - 1; l >= 0; l--) {
        const atLeft = this.getEntityAt({x: l, y: entity.y});
        if (atLeft && atLeft!=PARTICULE.water) break;
        const below = this.getEntityAt({x: l, y: entity.y + 1});
        if (below === 0) {
          distHoleLeft = entity.x - l;
          break;
        }
      }
      if (distHoleRight == distHoleLeft && distHoleRight!=this.cols) {
        if (left === 0) {
          nextPos = {x: entity.x - 1, y: entity.y};
        } else if (right === 0) {
          nextPos = {x: entity.x + 1, y: entity.y};
        }
      } else if (distHoleRight < distHoleLeft && right === 0) {
        nextPos = {x: entity.x + 1, y: entity.y};
      } else if (distHoleLeft < distHoleRight && left === 0) {
        nextPos = {x: entity.x - 1, y: entity.y};
      };
    }
    if (nextPos) {
      this.setEntityAt({entity: entity.particule, x: nextPos.x, y: nextPos.y, grid: this.copy});
      this.removeEntityAt({x: entity.x, y: entity.y, grid: this.copy});
    }
  }

}