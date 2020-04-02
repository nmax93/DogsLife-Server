const mongoose = require('mongoose')

const schema = {
  id: Number,
  private: Boolean,
  name: String,
  age: Number,
  gender: String,
  avatar: String,
  dogs: [Number],
  preferences: {
    dogs: {
      breads: [String],
      min_weight: Number,
      max_weight: Number
    },
    owners: {
      gender: String,
      min_age: Number,
      max_age: Number
    }
  },
  owner_matches: [Number],
  dog_matches: [Number]
}
const users_schema = new mongoose.Schema(schema)
const user = mongoose.model('user', users_schema)

module.exports = user