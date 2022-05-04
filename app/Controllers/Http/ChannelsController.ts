import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel, { ChannelType } from 'App/Models/Channel';
import ChannelUser, { Role } from 'App/Models/ChannelUser';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';

export default class ChannelsController {

	public async get(ctx: HttpContextContract) {
		await ctx.auth.use('api').authenticate();

		const user = ctx.auth.user!;
		if (user === undefined) {
			//TODO
			return {};
		}

		//get channels
		const channels = await Channel.all();
		const json = channels.map((ch) => ch.serialize());

		//prepare output
		let response = [] as any;
		for (const ch of json) {
			//get users and owner
			const channelUsers = await Database.from('vpwa_schema.channels_users').where('channel_id', ch.id);
			const channelOwner = await Database.from('vpwa_schema.channels_users').where('channel_id', ch.id).where('role', Role.owner);

			const users = await User.findMany(channelUsers.map((user) => user.user_id));
			const owner = await User.find(channelOwner[0].user_id);

			response.push({
				channelName: ch.name,
				isPrivate: ch.type == ChannelType.private,
				owner: owner,
				users: users,
				messages: [],
			})
		};

		return { channels: response };
	}

	public async create(ctx: HttpContextContract) {
		await ctx.auth.use('api').authenticate();

		const user = ctx.auth.user!;
		if (user === undefined) {
			//TODO
			return {};
		}

		const channel = new Channel();
		channel.name = ctx.request.input("channelName");
		channel.type = ctx.request.input("isPrivate") ? ChannelType.private : ChannelType.public;
		await channel.save();

		const channelUser = new ChannelUser();
		channelUser.user_id = user.id;
		channelUser.channel_id = channel.id;
		channelUser.role = Role.owner;
		await channelUser.save();


		return { channel: channel };
	}
}
