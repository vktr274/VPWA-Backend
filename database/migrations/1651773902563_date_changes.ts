import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Env from '@ioc:Adonis/Core/Env'

export default class DateChanges extends BaseSchema {
  protected channelsUsersTableName = 'channels_users'
  protected channelsTableName = 'channels'
  protected kickedChannelUsersTableName = 'kicked_channel_users'

  protected schemaName = Env.get('PG_SCHEMA')

  public async up () {
    this.schema.withSchema(
      this.schemaName
    ).alterTable(this.channelsUsersTableName, (table) => {
      table.dropColumns('joined_at', 'invited_at')
    })

    this.schema.withSchema(
      this.schemaName
    ).alterTable(this.channelsTableName, (table) => {
      table.dropColumn('last_activity_at')
    })

    this.schema.withSchema(
      this.schemaName
    ).alterTable(this.kickedChannelUsersTableName, (table) => {
      table.dropColumn('kicked_at')
    })
  }
}
