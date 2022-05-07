import MessagesController from 'App/Controllers/Http/MessagesController'
import SocketAuth from 'App/Middleware/SocketAuth'
import Channel, { ChannelType } from 'App/Models/Channel'
import ChannelUser, { Role } from 'App/Models/ChannelUser'
import Message from 'App/Models/Message'
import User, { Status } from 'App/Models/User'
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
    owner: string,
    messages: any[],
  }
}

var timeouts = new Map()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {

  let user: User;

  socket.on('connectUser', async (data) => {
    user = await SocketAuth.authenticate(data.token)

    //set user status
    user.status = data.status;
    await user.save();
  })

  socket.on('addMessage', async (data) => {
    const messageData = data as MessageData
    try {
      user = await SocketAuth.authenticate(messageData.token)
      const channel = await Channel.findByOrFail(
        "name",
        messageData.channelName
      )
      const message = await Message.create({
        text: messageData.text,
        userId: user.id,
        channelId: channel.id,
      } as any)
      socket.broadcast.emit('newMessage', messageData)
      console.log(message.serialize())

      if (timeouts.has(channel.name)) {
        clearTimeout(timeouts.get(channel.name))
        console.log("timeout cleared")
      }
      // reset timer here
      console.log("timeout set")
      timeouts.set(
        channel.name,
        setTimeout(async () => {
          console.log("timeout")
          try {
            channel.delete()
            socket.emit('deleteChannel', { channelName: channel.name })
            socket.broadcast.emit('deleteChannel', { channelName: channel.name })
          } catch (error) {
            console.log(error.mesage)
          }
        }, 2592000000/*ms = 30 days*/) // delete channel after 30 days of inactivity
      )
    } catch (error) {
      console.log(messageData)
      console.log(error.message)
    }
  })

  socket.on('invite', async (data) => {
    const inviteData = data as InviteData
    try {
      user = await SocketAuth.authenticate(inviteData.token)
      const toUser = await User.findByOrFail(
        'username',
        inviteData.toUser
      )

      const channel = await Channel.findByOrFail(
        "name",
        inviteData.channel.name
      )

      const channelUser = await ChannelUser.query()
        .select('role').where('user_id', user.id)
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

        inviteData.channel.messages = await MessagesController.getChannelMessages(channel.id);
        socket.broadcast.emit('newInvite', inviteData)
      } else {
        socket.emit('inviteError', { message: 'UNAUTHORIZED', user: user.username })
      }
    } catch (error) {
      console.log(inviteData)
      console.log(error.message)
      socket.emit('inviteError', { message: error.message.toString(), user: inviteData.fromUser })
    }
  });

  socket.on("channelDeleted", async (data) => {
    //auth
    try {
      user = await SocketAuth.authenticate(data.token)
    }
    catch (e) {
      console.log(e.message);
    };
    socket.broadcast.emit('deleteChannel', { channelName: data.channelName })
  })

  let disconnectUser = async () => {
    if (user != undefined) {
      //set status to offline
      user.status = Status.offline;
      await user.save();
    }
  };

  socket.on('end', async () => {
    disconnectUser();
  });

  socket.on('disconnect', async () => {
    disconnectUser();
  });
});
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
