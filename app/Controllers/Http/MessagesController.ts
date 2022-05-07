import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel';
import Message from 'App/Models/Message'
import User from 'App/Models/User'

export default class MessagesController {

  public async get(ctx: HttpContextContract) {
    const lastId = ctx.request.input('last');
    const channelName = ctx.request.input('channelName');

    const channel = await Channel.findBy("name", channelName)

    return {
      channel: channelName,
      messages: channel == undefined ? [] : await this.getChannelMessages(channel.id, lastId)
    };
  }

  //name substitute
  private async getChannelMessages(channelId: number, lastId?: number) {
    return MessagesController.getChannelMessages(channelId, lastId)
  }

  public static async getChannelMessages(channelId: number, lastId?: number) {
    const limit = 20;

    //get mesages
    let messages = Message.query().where("channel_id", channelId)
    if (lastId != undefined) {
      messages = messages.where("id", "<", lastId);
    }

    const paginated = await messages.orderBy("id", "desc").paginate(1, limit);
    const json = paginated.toJSON();

    //prepare output
    let response = [] as any[];
    for (const m of json.data.map((m) => m.serialize())) {

      const author = await User.find(m.user_id);
      response.push({
        id: m.id,
        author: author!.username,
        time: m.sent_at,
        text: m.text,
      })
    };
    return response.reverse();
  }
}
