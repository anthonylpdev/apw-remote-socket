import Canvas from './utils/canvas.mjs';
import Keyboard from './utils/keyboard.mjs';
import MainLoop from './lib/mainloop.mjs';
import Grid, {cursorsColors} from './entities/grid/cursor.mjs';
import Automaton, {PARTICULE} from './entities/grid/automaton.mjs';
import {domOn, domForEach} from './utils/dom.mjs';
import {cellsize, port, updateFreq, godPowersDelay, godAutoKick} from './conf.mjs';

const keyboard = new Keyboard();
const canvas = new Canvas({blur: 4});
const canvasCursor = new Canvas();
const automaton = new Automaton({ctx: canvas.getCtx(), cellsize, padding: 0, mustDrawGrid: false});
const gridCursor = new Grid({ctx: canvasCursor.getCtx(), cellsize, padding: 0, mustDrawGrid: false});
const mapCidCoord = new Map();
let mapCidParticules = new Map();
let myCid = null;

const consoleLog = document.querySelector('console-log');
function log(message) {
  consoleLog.insertAdjacentHTML('afterbegin', `<log-entry>${message}</log-entry>`)
}

const secure = window.location.protocol == 'https:';
const protocol = secure ? 'wss' : 'ws';
const WS = new WebSocket(`${protocol}://${window.location.hostname}${secure ? '' : `:${port}`}`);

WS.sendJson = (action, data = null) => {
  if (WS.readyState !== WebSocket.OPEN) return;
  WS.send(JSON.stringify({action, data}));
};

WS.addEventListener('message', evt => {
  let resp = JSON.parse(evt.data);
  if (!resp.message || resp.cid === undefined || !resp.message.action) return;
  const actionFctName = `on_${resp.message.action}`;
  if (!WS[actionFctName]) return;
  WS[`on_${resp.message.action}`](resp.message?.data, resp.cid);
});

WS.on_login = (data, cid) => log(`Anon${cid} is there`);

WS.on_full = (data, cid) =>  {
  document.querySelector('#loading').classList.add('hidden');
  document.querySelector('#full').classList.remove('hidden');
  automaton.grid = data;
  canvas.redraw();
};

// Server reconciliation on "world state" reception
WS.on_state = (data, cid) =>  {
  automaton.grid = data;
  MainLoop.start();
};

WS.on_start = (data, cid) => {
  // Set the client automaton grid with the authoritative's one
  myCid = cid;
  mapCidCoord.set(myCid, {x: -1, y: -1});
  automaton.grid = data;
  MainLoop.start();
  document.querySelector('#loading').classList.add('hidden');
}

WS.on_logout = (data, cid) => {
  log(`Anon${cid} leave this world`);
  // On logout, remove the cursor entity of this user
  const currentPos = mapCidCoord.get(cid);
  if (!currentPos) return;
  gridCursor.removeEntityAt(currentPos);
  mapCidCoord.delete(cid);
};

WS.on_create = (data, cid) => {
  const buffParticules = mapCidParticules.get(cid) ?? [];
  buffParticules.push(data);
  mapCidParticules.set(cid, buffParticules);
};

WS.on_move = (coord, cid) => {
  const entity = ((cid - 1) % cursorsColors.length) + 1;
  const currentPos = mapCidCoord.get(cid);
  if (currentPos) gridCursor.removeEntityAt(currentPos);
  gridCursor.setEntityAt({entity, ...coord});
  mapCidCoord.set(cid, coord);
};

WS.on_nogod = (data, cid) => {
  log(`There is no God in this World. Take the place, do the kode !`);
};

WS.on_god = (data, cid) => {
  document.querySelector('god-powers').classList.remove('hidden');
};

WS.on_newgod = (data, cid) => {
  log(`Anon${cid} is the new God (for ${Math.round(godAutoKick/60000)} min)`);
};

WS.on_godfailed = (data, cid) => {
  log(`You was too slow, the place is allready taken`);
};

WS.on_goddelay = (data, cid) => {
  log(`Your God power is limited, wait a bit before doing a new miracle`);
};

WS.on_reverse = (data, cid) => {
  automaton.grid = data;
  log(`The God Anon${cid} reversed the World`);
};

WS.on_gaia = (data, cid) => {
  automaton.grid = data;
  log(`The God Anon${cid} throws some seeds`);
};

WS.on_nuke = (data, cid) => {
  automaton.grid = data;
  log(`The God Anon${cid} set up us the bomb`);
};

WS.on_renounce = (data, cid) => {
  document.querySelector('god-powers').classList.add('hidden');
  automaton.grid = data;
  log(`God Anon${cid}: 'This world is doomed, I quit my job'. Take the place, do the kode!`);
};

WS.on_godkicked = (data, cid) => {
  document.querySelector('god-powers').classList.add('hidden');
  log(`The God Anon${cid} lose his throne. Take the place, do the kode !`);
}

keyboard.onCombo('ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'B', 'A', () => {
  WS.sendJson('make-me-god');
});

canvas.setDraw((ctx) => automaton.draw(ctx));
canvasCursor.setDraw((ctx) => gridCursor.draw(ctx));

MainLoop.setSimulationTimestep(updateFreq);

MainLoop.setUpdate((dt) => {
  automaton.update();
  // create particles from other clients
  for (const [cid, buffParticules] of mapCidParticules.entries()) {
    const particule = buffParticules.shift();
    if (!particule) continue;
    automaton.setEntityAt({entity:  particule.entity, x: particule.x, y: particule.y});
  }

  const lastCoord = mapCidCoord.get(myCid);
  if (mouseCoord && (mouseCoord.x != lastCoord.x || mouseCoord.y != lastCoord.y)) {
    WS.sendJson('move', mouseCoord);
    mapCidCoord.set(myCid, mouseCoord);
  }
  if (!clickIsActive) return;
  const entityAt = automaton.getEntityAt({...mouseCoord});
  if (entityAt == entity || !mouseCoord) return;
  automaton.setEntityAt({entity, ...mouseCoord});
  WS.sendJson('create', {entity, ...mouseCoord});
})

MainLoop.setDraw(() => {
  canvas.redraw();
  canvasCursor.redraw();
})

// Stop the loop on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden && MainLoop.isRunning()) {
    MainLoop.stop();
  } else if (!document.hidden && !MainLoop.isRunning()) {
    // We aks the backend for an authoritative state of the World
    mapCidParticules = new Map();
    WS.sendJson('get-state');
  }
});

let clickIsActive;
let mouseCoord = false;
let entity = PARTICULE.sand;
function manageMouse(evt) {
  let rect = canvas.get().getBoundingClientRect();
  let coord = automaton.getCoordFromPos({x: evt.clientX - rect.left, y: evt.clientY - rect.top});
  if (!coord) {
    mouseCoord = false;
    return;
  }
  mouseCoord = coord;
}

window.addEventListener('mousedown', evt => {
  clickIsActive = true;
  manageMouse(evt);
});
window.addEventListener('mouseup', evt => clickIsActive = false);
window.addEventListener('mousemove', evt => manageMouse(evt));

domOn('a-block', 'click', evt => {
  domForEach('a-block', ent => ent.classList.remove('selected'));
  let block = evt.target;
  block.classList.add('selected');
  entity = block.dataset.particule - 0;
})

const domCooldown = document.querySelector('#cooldown');
let cooldown = godPowersDelay / 1000;
domOn('god-power', 'click', evt => {
  let power = evt.target;
  WS.sendJson(power.dataset.power);
  if (cooldown != godPowersDelay / 1000) return;
  const t = setInterval(() => {
    domCooldown.textContent = --cooldown
    if (cooldown == 0) {
      clearInterval(t);
      cooldown = godPowersDelay / 1000;
      domCooldown.textContent = godPowersDelay / 1000;
    }
  }, 1000);
})