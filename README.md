# Poormans Discord api (vpwa-backend)

A backend api server for a Discord clone prograssive web app written using Adonis.js for VPWA (Development of Progressive Web Applications) course. The app has various api REST endpoints as well as socket connections, to serve the frontend app.

## REST Endpoints

The app serves various endpoints across controllers serving users, channels and messages. The app also uses an authentication middleware that protects endpoints from unauthorized access, except endpoints for registration and login.

### Users

- **POST** /register
- **POST** /login
- **POST** /status
- **GET** /status
- **GET** /users

### Channels

- **GET** /channels
- **POST** /channel
- **DELETE** /channels

### Messages

- **GET** /messages

## Sockets

Socket connection is established with frontend application using socket.io library. Sockets handle notification accross clients when new messages are posted into channels, after new users are invited or removed from channels. Several more usecases are handled by sockets according to app specification.

## Data model

Data model below was created before implementation, and later implemented with migrations.

<details>
<summary><b>Show database schema design</b></summary>

![DB](db_vpwa.svg)

</details>

<details>
<summary><b>Show production database schema</b></summary>

![DB](vpwa_db_datagrip.png)

</details>

## Run

Before running the backend create a `.env` file in the root of the project.

Example of `.env`:

```env
PORT=APP_PORT
HOST=APP_HOST
NODE_ENV=ENV_TYPE //like development or production
APP_KEY=SECRET_APP_KEY
DRIVE_DISK=local
DB_CONNECTION=pg
PG_HOST=POSTGRES_HOST
PG_PORT=POSTGRES_PORT
PG_USER=POSTGRES_USER
PG_PASSWORD=POSTGRES_USER_PASSWORD
PG_DB_NAME=POSTGRES_DATABASE_NAME
PG_SCHEMA=POSTGRES_SCHEMA_NAME

```

Run with `node ace serve` or `node ace serve --watch` for development.
