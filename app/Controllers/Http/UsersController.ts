import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import ChannelUser from 'App/Models/ChannelUser'
import User from 'App/Models/User'

export default class UsersController {
  public async register(ctx: HttpContextContract) {
    const user = await User.create({
      username: ctx.request.input("username"),
      name: ctx.request.input("name"),
      surname: ctx.request.input("surname"),
      email: ctx.request.input("email"),
      password: ctx.request.input("password")
    })
    const token = await ctx.auth.use("api").login(
      user,
      {
        expiresIn: "10 days"
      }
    )
    //return data
    return {
      token: token.toJSON(),
      user: {
        username: user?.username,
        email: user?.email,
      }
    }
  }

  public async login(ctx: HttpContextContract) {
    const token = await ctx.auth.use("api").attempt(
      ctx.request.input("username"),
      ctx.request.input("password"),
      {
        expiresIn: "10 days"
      }
    )
    //return data
    return {
      token: token.toJSON(),
      user: {
        username: ctx.auth.user?.username,
        email: ctx.auth.user?.email,
      }
    }
  }

  public async get(ctx: HttpContextContract) {
    //get channel
    const channelName = ctx.request.qs().channelName;
    const channel = await Channel.findBy("name", channelName);
    if (channel == null) {
      return { errors: `Channel '${channelName}' does not exist` };
    }

    //get users
    const channelUsers = await ChannelUser.query().where("channel_id", channel!.id);
    const users = await User.findMany(channelUsers.map((u) => u.userId))

    return {
      users: users.map((u) => ({
        username: u.username,
        email: u.email,
        status: u.status,
      }))
    };
  }
}
