const mongoose = require('mongoose')

const schema = {
  id: Number,
  grade: Number
}
const matches_schema = new mongoose.Schema(schema)
const match = mongoose.model('match', matches_schema)

module.exports = match