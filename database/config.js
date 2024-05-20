const fs = require('fs');
require('dotenv').config();
module.exports = {
    dev: {
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      host: process.env.DATABASE_HOST,
      port: 3306,
      dialect: 'mysql',

}}