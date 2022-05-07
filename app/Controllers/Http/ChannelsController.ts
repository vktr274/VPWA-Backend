import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel, { ChannelType } from 'App/Models/Channel';
import ChannelUser, { Role } from 'App/Models/ChannelUser';
import KickedChannelUser from 'App/Models/KickedChannelUser';
import User from 'App/Models/User';
import MessagesController from './MessagesController';

export default class ChannelsController {

	public async get(ctx: HttpContextContract) {
		//get channels user is in
		const usersChannels = await ChannelUser.query().where("user_id", ctx.auth.user!.id);
		const channelIds = usersChannels.map((ch) => ch.channelId);

		const channels = await Channel.findMany(channelIds);
		const json = channels.map((ch) => ch.serialize());

		//prepare output
		let response = [] as any;
		for (const ch of json) {
			//get owner
			const owner = await this.getChannelOwner(ch.id);

			response.push({
				channelName: ch.name,
				isPrivate: ch.type == ChannelType.private,
				owner: owner!.username,
				messages: await MessagesController.getChannelMessages(ch.id),
			})
		};

		return { channels: response };
	}

	public async create(ctx: HttpContextContract) {
		//create new if not in db
		const name = ctx.request.input("channelName");
		let channel = await Channel.findBy("name", name);
		let channelCreated = false;

		if (channel == null) {
			channel = new Channel();
			channel.name = name;
			channel.type = ctx.request.input("isPrivate") ? ChannelType.private : ChannelType.public;
			await channel.save();
			channelCreated = true;
		}

		//add user if not in channel
		const user = ctx.auth.user!;
		let channelUser = await ChannelUser.query().where("channel_id", channel.id).where("user_id", user.id).first();

		if (channelUser == null) {
			//test if user is atempting to join private channel
			if (channel.type == ChannelType.private && !channelCreated) {
				return { errors: `Channel '${channel.name}' is private` };
			}

			//prevent banned user from entering the channel
			const numberOfKicks = (await KickedChannelUser.query().where("user_id", user.id).where("channel_id", channel.id)).length;
			if (numberOfKicks >= 3) {
				return { errors: `You are banned from channel '${channel.name}'. Contact channel owner to invite you` };
			}

			//create channelUser
			channelUser = new ChannelUser();
			channelUser.userId = user.id;
			channelUser.channelId = channel.id;
			channelUser.role = channelCreated ? Role.owner : Role.regular;
			await channelUser.save();
		}

		return {
			channel: {
				channelName: channel.name,
				isPrivate: channel.type == ChannelType.private,
				owner: (await this.getChannelOwner(channel.id))!.username,
				messages: await MessagesController.getChannelMessages(channel.id),
			}
		};
	}

	public async delete(ctx: HttpContextContract) {
		const name = ctx.request.input("channelName");
		const channel = await Channel.findBy("name", name);
		const id = channel!.id;

		//test if user is owner
		const user = ctx.auth.user!;
		const owner = await this.getChannelOwner(id);

		if (user.id == owner!.id) {
			//delete
			channel!.delete();
			return {
				channel: `${name} deleted`,
			};
		}
		else {
			//let user leave channel
			const userChannel = await ChannelUser.query().where("user_id", user.id).where("channel_id", id).first();
			userChannel!.delete();
			return {
				channel: `${user.username} left channel ${name}`
			}
		}
	}

	private async getChannelOwner(id: number) {
		const channelOwner = await ChannelUser.query().where('channel_id', id).where('role', Role.owner).first();
		return User.find(channelOwner!.userId);
	}

	public static async getChannelOwnerId(channelId: number) {
		return (await ChannelUser.query().where('channel_id', channelId).where('role', Role.owner).first())!.userId;
	}
}
