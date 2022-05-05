/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get("", async () => {
    return {
      routes: [
        {
          GET: [
            "/users",
            "/channels",
            "/messages"],
        }, {
          POST: [
            "/register",
            "/login",
            "/channel"],
        }, {
          DELETE: [
            "/channel",],
        }]
    }
  })

  //users
  Route.post("register", "UsersController.register");
  Route.post("login", "UsersController.login");

  Route.get("users", "UsersController.get").middleware('auth');

  //channels
  Route.get("channels", "ChannelsController.get").middleware('auth');
  Route.post("channel", "ChannelsController.create").middleware('auth');
  Route.delete("channel", "ChannelsController.delete").middleware('auth');

  //messages
  Route.get("messages", "MessagesController.get",).middleware('auth');
})
