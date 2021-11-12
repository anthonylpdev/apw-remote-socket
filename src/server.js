//TODO: pour chaque modification, penser à couper et relancer

const express = require('express')
const {createServer} = require('http')
const {Server} = require('socket.io')

const app = express()
const httpServer = createServer(app)

//TODO: par soucis de praticité, j'ai mis * pour les CORS mais théoriquement il faut définir les vrai URL
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
})

httpServer.listen(3000)

io.on('connect', (socket) => {
  socket.on('DRAW', (data) => {
    socket.emit('DRAW_CLASSROOM', socket.id)
    socket.broadcast.emit('DRAW_CLASSROOM', data)
  })

  socket.on('FOCUS_BILLBOARD', (data) => {
    socket.emit('FOCUS_BILLBOARD', socket.id)
    socket.broadcast.emit('FOCUS_BILLBOARD', data)
  })

  socket.on('BASE_CAMERA', (data) => {
    socket.emit('BASE_CAMERA', socket.id)
    socket.broadcast.emit('BASE_CAMERA', data)
  })

  socket.on('CLEAR_BILLBOARD', (data) => {
    socket.emit('CLEAR_BILLBOARD', socket.id)
    socket.broadcast.emit('CLEAR_BILLBOARD', data)
  })

  socket.on('TV_ON', (data) => {
    socket.emit('TV_ON', socket.id)
    socket.broadcast.emit('TV_ON', data)
  })
})
