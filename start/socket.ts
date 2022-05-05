import SocketAuth from 'App/Middleware/SocketAuth'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'
import Ws from 'App/Services/Ws'

Ws.boot()

interface MessageData {
  userName: string,
  channelName: string,
  text: string
}

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' })

  socket.on('addMessage', async (data) => {
    const messageData = data as MessageData
    try {
      const channel = await Channel.findByOrFail(
        "name",
        messageData.channelName
      )
      const user = await User.findByOrFail(
        "username",
        messageData.userName
      )
      const message = await Message.create({
        text: messageData.text,
        userId: user.id,
        channelId: channel.id
      })
      console.log(message.serialize())
    } catch (error) {
      console.log(messageData)
      console.log(error.message)
    }
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

