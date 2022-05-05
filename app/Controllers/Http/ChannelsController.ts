import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel, { ChannelType } from 'App/Models/Channel';
import ChannelUser, { Role } from 'App/Models/ChannelUser';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import Message from 'App/Models/Message';

export default class ChannelsController {

	public async get(ctx: HttpContextContract) {
		await ctx.auth.use('api').authenticate();

		const user = ctx.auth.user!;
		if (user === undefined) {
			//TODO
			return { error: "jop" };
		}

		//get channels
		const channels = await Channel.all();
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
				messages: await this.getChannelMessages(ch.id),
			})
		};

		return { channels: response };
	}

	public async create(ctx: HttpContextContract) {
		await ctx.auth.use('api').authenticate();

		const user = ctx.auth.user!;
		if (user === undefined) {
			//TODO
			return { errors: "jop" };
		}

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
		let channelUser = await ChannelUser.query().where("channel_id", channel.id).where("user_id", user.id).first();

		if (channelUser == null) {
			channelUser = new ChannelUser();
			channelUser.user_id = user.id;
			channelUser.channel_id = channel.id;
			channelUser.role = channelCreated ? Role.owner : Role.regular;
			await channelUser.save();
		}

		return {
			channel: {
				channelName: channel.name,
				isPrivate: channel.type == ChannelType.private,
				owner: (await this.getChannelOwner(channel.id))!.username,
				messages: await this.getChannelMessages(channel.id),
			}
		};
	}

	public async delete(ctx: HttpContextContract) {
		await ctx.auth.use('api').authenticate();

		const user = ctx.auth.user!;
		if (user === undefined) {
			//TODO
			return { errors: "jop" };
		}

		const name = ctx.request.input("channelName");
		const channel = await Channel.findBy("name", name);
		const id = channel!.id;

		//test if user is owner
		const channelOwner = await Database.from('vpwa_schema.channels_users').where('channel_id', id).where('role', Role.owner);
		const owner = await User.find(channelOwner[0].user_id);

		if (user.id != owner!.id) {
			return { errors: `${id} NOT deleted` }
		} else {
			//delete
			channel!.delete();
			return {
				channel: `${id} deleted`,
			};
		}
	}

	private async getChannelOwner(id: number) {
		const channelOwner = await ChannelUser.query().where('channel_id', id).where('role', Role.owner).first();
		return User.find(channelOwner!.user_id);
	}

	private async getChannelMessages(id: number) {
		const messages = await Message.query().where("channel_id", id); //TODO pagination
		const json = messages.map((m) => m.serialize());

		//prepare output
		let response = [] as any;
		for (const m of json) {
			const author = await User.find(m.user_id);

			response.push({
				author: author!.name,
				time: m.sent_at,
				text: m.text,
			})
		};
		return response;
	}
}
