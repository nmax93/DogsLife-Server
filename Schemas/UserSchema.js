const mongoose = require('mongoose')
var Schema = mongoose.Schema;

const visitedGardenSchema = Schema({
  garden_id: Number,
  last_visit: { type: Date, default: Date.now },
  total_visits: { type: Number, default: 0 },
});
const schema = {
  id: Number,
  device_mac_id: String,
  name: String,
  age: Date, //or string
  gender: Boolean, //false m, true fm
  avatar: String,
  dogs: [Number],
  matches: [Number], 
  visited_gardens: [visitedGardenSchema],
  hobbies: [Boolean], //[size 8]           ///m 32%
  walk_routine: Object,                          ///m 20%  if same type +10, if duration +10 ---deviation 15 min
  hangouts: [Boolean],    //[size 4]       ///m 28%
  number_of_dogs: Number, //if equal       ///m 10%
  raise_with: Number,     //if same (3 options)  ///m 10%
  feeding_hours: {
    morning: Number,
    noon: Number,
    evening: Number
  }
}

const users_schema = new mongoose.Schema(schema)
const User = mongoose.model('user', users_schema)
const visitedGarden = mongoose.model('visitedGarden', visitedGardenSchema)
module.exports = {
  User,
  visitedGarden
} 
