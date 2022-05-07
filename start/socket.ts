import ChannelsController from 'App/Controllers/Http/ChannelsController'
import MessagesController from 'App/Controllers/Http/MessagesController'
import SocketAuth from 'App/Middleware/SocketAuth'
import Channel, { ChannelType } from 'App/Models/Channel'
import ChannelUser, { Role } from 'App/Models/ChannelUser'
import KickedChannelUser from 'App/Models/KickedChannelUser'
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
    } catch (error) {
      console.log(messageData)
      console.log(error.message)
    }
  })

  socket.on('invite', async (data) => {
    const inviteData = data as InviteData
    try {
      user = await SocketAuth.authenticate(inviteData.token)

      //fetch data
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
      const channelOwnerId = await ChannelsController.getChannelOwnerId(channel.id);

      //test if toUser is banned from channel
      const kicked = await KickedChannelUser.query().where("user_id", toUser.id).where("channel_id", channel.id)
      const numberOfKicks = kicked.length;

      if (numberOfKicks >= 3) {
        if (user.id == channelOwnerId) {
          //channel owners invite deletes all kicks
          for (var i = 0; i < numberOfKicks; i++) kicked[i].delete();
        }
        else {
          socket.emit('inviteError', {
            message: `User '${inviteData.toUser}' is banned from this server. Contact channel owner to invite the user for you`,
            user: user.username
          });
          return;
        }
      }

      //send invite
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

  socket.on("revokeUser", async (data) => {
    try {
      user = await SocketAuth.authenticate(data.token)

      const removedUser = await User.findByOrFail(
        'username',
        data.userName
      );
      const channel = await Channel.findByOrFail(
        "name",
        data.channelName
      );

      //remove user from channel
      const channelUser = await ChannelUser.query()
        .where('user_id', removedUser.id)
        .andWhere('channel_id', channel.id)
        .firstOrFail();
      channelUser.delete();

      //emit change to user
      socket.broadcast.emit('deleteChannel', { channelName: data.channelName, userName: data.userName });
    }
    catch (e) {
      console.log(e.message);
    };
  });

  socket.on("kickUser", async (data) => {
    try {
      user = await SocketAuth.authenticate(data.token)

      const kickedUser = await User.findByOrFail(
        'username',
        data.userName
      );
      const channel = await Channel.findByOrFail(
        "name",
        data.channelName
      );
      const channelOwnerId = await ChannelsController.getChannelOwnerId(channel.id);

      //add user to kick list
      let numberOfKicks = 1;
      if (user.id == channelOwnerId) {
        numberOfKicks = 3;
      }

      for (let i = 0; i < numberOfKicks; i++) {
        await KickedChannelUser.create({
          byUserId: user.id,
          userId: kickedUser.id,
          channelId: channel.id
        });
      }

      //remove user from channel
      const channelUser = await ChannelUser.query()
        .where('user_id', kickedUser.id)
        .andWhere('channel_id', channel.id)
        .firstOrFail();
      channelUser.delete();

      //emit change to user
      socket.broadcast.emit('deleteChannel', { channelName: data.channelName, userName: data.userName });
    }
    catch (e) {
      console.log(e.message);
    };
  })

  socket.on("channelDeleted", async (data) => {
    //auth
    try {
      user = await SocketAuth.authenticate(data.token)
    }
    catch (e) {
      console.log(e.message);
    };
    socket.broadcast.emit('deleteChannel', { channelName: data.channelName });
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
