#!/usr/bin/env bash

# migration
node ace migration:run

# start server
node ace serve --watch
