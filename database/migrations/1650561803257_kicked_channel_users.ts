import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Env from '@ioc:Adonis/Core/Env'

export default class KickedChannelUsers extends BaseSchema {
  protected tableName = 'kicked_channel_users'

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
        .foreign('by_user_id')
        .references('users.id')
        .nullable()
        .onDelete('SET NULL')
      table
        .foreign('channel_id')
        .references('channels.id')
        .notNullable()
        .onDelete('CASCADE')
      table
        .timestamp('kicked_at', { useTz: true })
        .notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
