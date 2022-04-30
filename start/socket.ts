import SocketAuth from 'App/Middleware/SocketAuth'
import Ws from 'App/Services/Ws'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' })

  socket.on('addMessage', (data) => {
    console.log(data)
  })
})

Ws.io.use((socket, next) => {
  try {
    SocketAuth.authenticate(socket)
    next()
  } catch (error) {
    next(new Error("AUTH_ERROR"))
  }
})
