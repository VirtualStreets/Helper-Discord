// config.js
require('dotenv').config();

module.exports = {
    TOKEN: process.env.TOKEN,
    SERVER_ID: process.env.SERVER_ID,
    PREFIX: "!"  // You can make prefix configurable
};
