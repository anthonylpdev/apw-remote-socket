//TODO: pour chaque modification, penser à couper et relancer

const express = require('express')
// const {createServer} = require('http')
const {createServer} = require('https')
const { readFileSync } = require('fs');
const path = require('path');
const {Server} = require('socket.io')

const app = express()
const basePath = path.dirname(__filename);
const httpServer = createServer({
  key: readFileSync(basePath + '/mkcert/localhost+1-key.pem'),
  cert: readFileSync(basePath + '/mkcert/localhost+1.pem')
})
// const httpServer = createServer(app);

//TODO: par soucis de praticité, j'ai mis * pour les CORS mais théoriquement il faut définir les vrai URL
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
}, app)

httpServer.listen(3000)

io.on('connect', (socket) => {
  socket.on('TOUCH_UP', (data) => {
    socket.emit('CAMERA_UP', socket.id)
    socket.broadcast.emit('CAMERA_UP', data)
  })
  socket.on('TOUCH_DOWN', (data) => {
    socket.emit('CAMERA_DOWN', socket.id)
    socket.broadcast.emit('CAMERA_DOWN', data)
  })
  socket.on('TOUCH_LEFT', (data) => {
    socket.emit('CAMERA_LEFT', socket.id)
    socket.broadcast.emit('CAMERA_LEFT', data)
  })
  socket.on('TOUCH_RIGHT', (data) => {
    socket.emit('CAMERA_RIGHT', socket.id)
    socket.broadcast.emit('CAMERA_RIGHT', data)
  })

  socket.on('PHONE_MOVE', (data) => {
    //console.log(data);
    socket.emit('GYROMETER', data)
    socket.broadcast.emit('GYROMETER', data)
  })
})
