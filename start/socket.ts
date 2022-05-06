import SocketAuth from 'App/Middleware/SocketAuth'
import Channel from 'App/Models/Channel'
import ChannelUser from 'App/Models/ChannelUser'
import Message from 'App/Models/Message'
import User from 'App/Models/User'
import Ws from 'App/Services/Ws'

Ws.boot()

interface MessageData {
  token: string,
  userName: string,
  channelName: string,
  time: string
  text: string
}

interface InviteData {
  token: string,
  fromUser: string,
  toUser: string,
  channel: {
    name: string,
    isPrivate: boolean,
    owner: string
  }
}

export enum Role {
  owner = 'owner',
  regular = 'regular'
}

export enum ChannelType {
  private = 'private',
  public = 'public'
}

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' })

  socket.on('addMessage', async (data) => {
    const messageData = data as MessageData
    try {
      const user = await SocketAuth.authenticate(messageData.token)
      const channel = await Channel.findByOrFail(
        "name",
        messageData.channelName
      )
      const message = await Message.create({
        text: messageData.text,
        userId: user.id,
        channelId: channel.id,
      })
      socket.broadcast.emit('newMessage', messageData)
      console.log(message.serialize())
    } catch (error) {
      console.log(messageData)
      console.log(error.message)
    }
  })

  socket.on('invite', async (data) => {
    const inviteData = data as InviteData
    try {
      const fromUser = await SocketAuth.authenticate(inviteData.token)
      const toUser = await User.findByOrFail(
        'username',
        inviteData.toUser
      )

      const channel = await Channel.findByOrFail(
        "name",
        inviteData.channel.name
      )

      const channelUser = await ChannelUser.query()
        .select('role').where('user_id', fromUser.id)
        .andWhere('channel_id', channel.id)
        .firstOrFail()

      if (
        (channel.type == ChannelType.private && channelUser.role == Role.owner) ||
        (channel.type == ChannelType.public)
      ) {
        const invitation = await ChannelUser.create({
          userId: toUser.id,
          channelId: channel.id
        })
        console.log(invitation.serialize())
        socket.broadcast.emit('newInvite', inviteData)
      } else {
        socket.emit('inviteError', { message: 'UNAUTHORIZED', user: fromUser.username })
      }
    } catch (error) {
      console.log(inviteData)
      console.log(error.message)
      socket.emit('inviteError', { message: error.message.toString(), user: inviteData.fromUser })
    }
  })
})

/*
Ws.io.use((socket, next) => {
  try {
    SocketAuth.authenticate(socket)
    next()
  } catch (error) {
    next(new Error("AUTH_ERROR"))
  }
})
*/
