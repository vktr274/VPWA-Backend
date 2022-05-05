import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

export default class MessagesController {
  public async addMessage(ctx: HttpContextContract) {
    const user = ctx.auth.use("api").user
    if (user == null) {
      return ctx.response.status(401).json(
        {
          message: "User not logged in - unauthorized"
        }
      )
    }
    const channel = await Channel.findByOrFail(
      "id",
      ctx.request.input("channel_id")
    )
    const message = await Message.create({
      text: ctx.request.input("text")
    })
    await message.related("user").associate(user)
    await message.related("channel").associate(channel)
  }

  public static async getChannelMessages(id: number) {
    const messages = await Message.query().where("channel_id", id); //TODO pagination
    const json = messages.map((m) => m.serialize());

    //prepare output
    let response = [] as any;
    for (const m of json) {
      const author = await User.find(m.user_id);

      response.push({
        author: author!.username,
        time: m.sent_at,
        text: m.text,
      })
    };
    return response;
  }
}
