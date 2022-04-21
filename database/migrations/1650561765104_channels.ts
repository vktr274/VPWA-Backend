import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ChannelType } from 'App/Models/Channel'
import Env from '@ioc:Adonis/Core/Env'

export default class Channels extends BaseSchema {
  protected tableName = 'channels'

  public async up () {
    this.schema.withSchema(
      Env.get('PG_SCHEMA')
    ).createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').unique().notNullable()
      table
        .enum('type', Object.values(ChannelType))
        .defaultTo(ChannelType.public)
        .notNullable()
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
      table
        .timestamp('last_activity_at', { useTz: true })
        .notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
