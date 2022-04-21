import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Env from '@ioc:Adonis/Core/Env'

export default class Messages extends BaseSchema {
  protected tableName = 'messages'

  public async up () {
    this.schema.withSchema(
      Env.get('PG_SCHEMA')
    ).createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .foreign('user_id')
        .references('users.id')
        .nullable()
        .onDelete('SET NULL')
      table
        .foreign('channel_id')
        .references('channels.id')
        .notNullable()
        .onDelete('CASCADE')
      table.text('text').notNullable()
      table
        .timestamp('sent_at', { useTz: true })
        .notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
