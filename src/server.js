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
})
