import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel';
import Message from 'App/Models/Message'
import User from 'App/Models/User'

export default class MessagesController {

  public async get(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1);
    const channelName = ctx.request.input('channelName');

    return { messages: await this.getChannelMessages((await Channel.findBy("name", channelName))!.id, page) };
  }

  //name substitute
  private async getChannelMessages(id: number, page: number) {
    return MessagesController.getChannelMessages(id, page)
  }

  public static async getChannelMessages(id: number, page: number) {
    const limit = 20;

    //get mesages
    const messages = await Message.query().where("channel_id", id).orderBy("id", 'desc').paginate(page, limit);
    const json = messages.toJSON();

    //prepare output
    let response = [] as any[];
    for (const m of json.data.map((m) => m.serialize())) {

      const author = await User.find(m.user_id);
      response.push({
        author: author!.username,
        time: m.sent_at,
        text: m.text,
      })
    };
    return response.reverse();
  }
}
