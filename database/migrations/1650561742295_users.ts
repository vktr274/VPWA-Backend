import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { Status } from 'app/Models/User'
import Env from '@ioc:Adonis/Core/Env'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.withSchema(
      Env.get('PG_SCHEMA')
    ).createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('username').unique().notNullable()
      table.string('name').notNullable()
      table.string('surname').notNullable()
      table.string('email').unique().notNullable()
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
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
