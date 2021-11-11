import  WebSocket, { WebSocketServer } from 'ws';
import Automaton, {PARTICULE} from '../front/entities/grid/automaton.mjs';
import {cellsize, port, updateFreq, godPowersDelay, godAutoKick} from '../front/conf.mjs';
import MainLoop from '../front/lib/mainloop.mjs';

const maxClients = 5;
const allowForBroadcast = ['create', 'move'];
const godPowers = ['reverse', 'gaia', 'nuke', 'renounce'];

let godDelayActive = false;
let godTimerDelay = null;
let hasGod = false;
let godTimerKick = null;


const ctx = {canvas: {height: 807, width: 807}};
let mapCidParticules = new Map();

// Simulate the automaton on the backend sie to get an authoritative world state
const automaton = new Automaton({ctx, cellsize});
MainLoop.setSimulationTimestep(updateFreq);
MainLoop.setUpdate((dt) => {
  automaton.update();
  for (const [cid, buffParticules] of mapCidParticules.entries()) {
    const particule = buffParticules.shift();
    if (!particule) continue;
    automaton.setEntityAt({entity: particule.entity, x: particule.x, y: particule.y});
  }
})
MainLoop.start()

const clients = new Map();
let clientId = 1;


const wss = new WebSocketServer({port});
console.log(`WebSocket server is running on port ${port}`);

wss.on('connection', client => {

  // check if server is full
  if (clients.size >= maxClients) {
    send({action: 'full', data: automaton.grid}, 0, client);
    client.terminate();
    return;
  }

  // add the client to the clients list
  const cid = clientId++;
  clients.set(client, cid);

  // Send the list of all the currently connected users
  sendAllUsersToClient(client);

  // Send "start signal" to the new client with the authoritative world state
  send({action: 'start', data: automaton.grid}, cid, client);

  // A new user is not the god
  client.isGod = false;

  // boradcast the new connected user to the others clients
  broadcast({action: 'login'}, client);

  // Each time a msg is recieved, analyse it and send it bak to the other clients
  client.on('message', message => {
    try {
      // TODO validation
      const msg = JSON.parse(message);

      // if a user want the authoritative world state, send it do not brodcast the request
      if (msg.action === 'get-state') {
        send({action: 'state', data: automaton.grid}, 0, client);
      }

      // if a user want to become the new god, check if the god place is free
      if (msg.action === 'make-me-god') {
        if (!hasGod) {
          hasGod = true;
          client.isGod = true;
          send({action: 'god'}, 0, client);
          broadcastAll({action: 'newgod'}, cid);
          godTimerKick = setTimeout(() => {
            hasGod = false;
            client.isGod = false;
            clearTimeout(godTimerDelay);
            godDelayActive = false;
            broadcastAll({action: 'godkicked'}, cid);
          }, godAutoKick);
        } else {
          send({action: 'godfailed'}, 0, client);
        }
      }

      // if a user create a particule, create the same on the authoritative world state
      if (msg.action === 'create') {
        let buffParticules = mapCidParticules.get(cid) ?? [];
        buffParticules.push(msg.data);
        mapCidParticules.set(cid, buffParticules);
      }

      // GOD MODE actions
      if (client.isGod && godPowers.includes(msg.action)) {
        // Power cooldowns management
        if (godDelayActive) {
          send({action: 'goddelay'}, 0, client);
          return;
        }
        godDelayActive = true;
        godTimerDelay = setTimeout(() => godDelayActive = false, godPowersDelay);

        if (msg.action === 'reverse') {
          automaton.mirror();
          broadcastAll({action: 'reverse', data: automaton.grid}, cid);
        }

        if (msg.action === 'gaia') {
          for (let i = 0; i < Math.random()*5+3; i++) {
            automaton.setEntityAt({
              entity: PARTICULE.seed,
              x: Math.floor(Math.random()*automaton.cols),
              y: Math.floor(Math.random()*automaton.rows),
            });
          }
          broadcastAll({action: 'gaia', data: automaton.grid}, cid);
        }

        if (msg.action === 'nuke') {
          for (let i = 0; i < Math.random()*10+6; i++) {
            automaton.setEntityAt({
              entity: PARTICULE.nuke,
              x: Math.floor(Math.random()*automaton.cols),
              y: Math.floor(Math.random()*automaton.rows),
            });
          }
          broadcastAll({action: 'nuke', data: automaton.grid}, cid);
        }

        if (msg.action === 'renounce') {
          for (let i = 0; i < 1000; i++) {
            automaton.setEntityAt({
              entity: PARTICULE.nuke,
              x: Math.floor(Math.random()*automaton.cols),
              y: Math.floor(Math.random()*automaton.rows),
            });
          }
          clearTimeout(godTimerKick);
          clearTimeout(godTimerDelay);
          godDelayActive = false;
          client.isGod = false;
          hasGod = false;
          broadcastAll({action: 'renounce', data: automaton.grid}, cid);
        }

      }

      // broadcast allowed action
      if (allowForBroadcast.includes(msg.action)) {
        broadcast(msg, client);
      }
    } catch (e) {};
  });

  client.on('close', () => {
    // On close, send the logout to all room's clients
    broadcast({action: 'logout'}, client);

    // if the client was the god, the place is now free !
    if (client.isGod) {
      hasGod = false;
      clearTimeout(godTimerDelay);
      clearTimeout(godTimerKick);
      godDelayActive = false;
      broadcastAll({action: 'nogod'});
    };

    // Remove the user from the clients list
    clients.delete(client);

    // Reset client id if no one left
    if (clients.size == 0) clientId = 1;
  });
});

function send(message, cid, destClient) {
  if (destClient.readyState !== WebSocket.OPEN) return;
  destClient.send(JSON.stringify({message, cid}));
}

function broadcast(message, from) {
  const cid = clients.get(from);
  for (const client of clients.keys()) {
    if (client !== from) {
      send(message, cid, client);
    }
  }
}

function broadcastAll(message, cid = 0) {
  for (const client of clients.keys()) {
    send(message, cid, client);
  }
}

function sendAllUsersToClient(destClient) {
  for (let cid of clients.values()) {
    send({action: 'login'}, cid, destClient);
  }
  if (!hasGod) {
    send({action: 'nogod'}, 0, destClient);
  };
}