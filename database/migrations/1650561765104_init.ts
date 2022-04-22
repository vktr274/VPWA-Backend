import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ChannelType } from 'App/Models/Channel'
import { Status } from 'App/Models/User'
import { Role } from 'App/Models/ChannelUser'
import Env from '@ioc:Adonis/Core/Env'

export default class Channels extends BaseSchema {
  protected usersTableName = 'users'
  protected channelsTableName = 'channels'
  protected messagesTableName = 'messages'
  protected channelsUsersTableName = 'channels_users'
  protected kickedChannelUsersTableName = 'kicked_channel_users'

  protected schemaName = Env.get('PG_SCHEMA')

  public async up () {
    this.schema.withSchema(
      this.schemaName
    ).createTable(this.usersTableName, (table) => {
      table.increments('id').primary()
      table.string('username', 64).unique().notNullable()
      table.string('name', 64).notNullable()
      table.string('surname', 64).notNullable()
      table.string('email', 64).unique().notNullable()
      table.string('password').notNullable()
      table
        .enum('status', Object.values(Status))
        .defaultTo(Status.online)
        .notNullable()
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
      table
        .timestamp('updated_at', { useTz: true })
        .notNullable()
    })

    this.schema.withSchema(
      this.schemaName
    ).createTable(this.channelsTableName, (table) => {
      table.increments('id').primary()
      table.string('name', 64).unique().notNullable()
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

    this.schema.withSchema(
      this.schemaName
    ).createTable(this.messagesTableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable(this.schemaName + '.users')
        .nullable()
        .onDelete('SET NULL')
      table
        .integer('channel_id')
        .unsigned()
        .references('id')
        .inTable(this.schemaName + '.channels')
        .notNullable()
        .onDelete('CASCADE')
      table.text('text').notNullable()
      table
        .timestamp('sent_at', { useTz: true })
        .notNullable()
    })

    this.schema.withSchema(
      this.schemaName
    ).createTable(this.channelsUsersTableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable(this.schemaName + '.users')
        .notNullable()
        .onDelete('CASCADE')
      table
        .integer('channel_id')
        .unsigned()
        .references('id')
        .inTable(this.schemaName + '.channels')
        .notNullable()
        .onDelete('CASCADE')
      table
        .enum('role', Object.values(Role))
        .defaultTo(Role.regular)
        .notNullable()
      table
        .integer('kick_count').checkBetween([0, 3])
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

    this.schema.withSchema(
      this.schemaName
    ).createTable(this.kickedChannelUsersTableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable(this.schemaName + '.users')
        .notNullable()
        .onDelete('CASCADE')
      table
        .integer('by_user_id')
        .unsigned()
        .references('id')
        .inTable(this.schemaName + '.users')
        .nullable()
        .onDelete('SET NULL')
      table
        .integer('channel_id')
        .unsigned()
        .references('id')
        .inTable(this.schemaName + '.channels')
        .notNullable()
        .onDelete('CASCADE')
      table
        .timestamp('kicked_at', { useTz: true })
        .notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.channelsTableName)
    this.schema.dropTable(this.usersTableName)
    this.schema.dropTable(this.messagesTableName)
    this.schema.dropTable(this.channelsUsersTableName)
    this.schema.dropTable(this.kickedChannelUsersTableName)
  }
}
