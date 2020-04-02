const mongoose = require('mongoose')

const schema = {
  id: Number,
  name: String,
  image: String,
  lat: Number,
  long: Number,
  present_dogs: [Number],
  todays_visitors: [Number]
}
const gardens_schema = new mongoose.Schema(schema)
const garden = mongoose.model('garden', gardens_schema)

module.exports = garden