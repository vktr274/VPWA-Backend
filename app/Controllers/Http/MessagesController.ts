import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'

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
}
