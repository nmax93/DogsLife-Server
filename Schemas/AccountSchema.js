const mongoose = require('mongoose')

const schema = {
  username: String,
  password: String,
  user_profile: Number,
}
const account_schema = new mongoose.Schema(schema)
const account = mongoose.model('account', account_schema)

module.exports = account