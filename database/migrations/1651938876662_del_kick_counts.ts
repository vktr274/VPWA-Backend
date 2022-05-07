import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Env from '@ioc:Adonis/Core/Env'

export default class ChannelTimers extends BaseSchema {
  protected tableName = 'channels_users'

  protected schemaName = Env.get('PG_SCHEMA')

  public async up () {
    this.schema.withSchema(
      this.schemaName
    ).alterTable(this.tableName, (table) => {
      table.dropColumn("kick_count")
    })
  }
}
