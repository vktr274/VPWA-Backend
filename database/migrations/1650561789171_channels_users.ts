import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { Role } from 'App/Models/ChannelUser'
import Env from '@ioc:Adonis/Core/Env'

export default class ChannelsUsers extends BaseSchema {
  protected tableName = 'channels_users'

  public async up () {
    this.schema.withSchema(
      Env.get('PG_SCHEMA')
    ).createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .foreign('user_id')
        .references('users.id')
        .notNullable()
        .onDelete('CASCADE')
      table
        .foreign('channel_id')
        .references('channels.id')
        .notNullable()
        .onDelete('CASCADE')
      table
        .enum('role', Object.values(Role))
        .defaultTo(Role.regular)
        .notNullable()
      table
        .integer('kick_count')
        .unsigned()
        .defaultTo(0)
        .notNullable()
      table
        .timestamp('joined_at', { useTz: true })
        .nullable()
      table
        .timestamp('invited_at', { useTz: true })
        .notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
