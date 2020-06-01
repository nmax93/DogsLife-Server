const mongoose = require('mongoose')

const schema = { //60%
  id: Number,
  collar_mac_id: String,
  service_uuid: String, //?
  owners: [Number],
  name: String,
  description: String,
  avatar: String,
  avg_time_in_garden: {
    time: Number,
    visits: Number
  },
  get_along: {                               ///m c 100%
    gender: Number,  //1 m, 2 fm, 3 both
    spayed: Number, //1 spayed, 2 not spayed, 3 both
    size: Number,    //1 small, 2 big, 3 both
  },
  physical_params: {
    breed: String,                           ///m 10%
    mixed: Boolean,
    gender: Number,
    age: Date, //or string
    weight: Number,
    spayed: Number, //1 apayed, 2 not spayed
    size: Number //1 small, 2 big
  },
  character_params: {
    energy_level: Number,     //size 1-3      ///m deviation of 1   60%
    avg_play_time: Number,
    playfullness: Boolean,                   ///m                  60%
    park_preference: Number    //1 empty, 2 crowded, 3 both
  }
}
const dogs_schema = new mongoose.Schema(schema)
const dog = mongoose.model('dog', dogs_schema)

module.exports = dog
