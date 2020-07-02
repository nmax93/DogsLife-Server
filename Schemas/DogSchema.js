const mongoose = require('mongoose')
var Schema = mongoose.Schema;

const visitedGardenSchema = Schema({
   garden_id: Number,
  last_visit: { type: Date, default: Date.now },
  total_visits: { type: Number, default: 0 },
      avg_play_time: { type: Number, default: 0 }, // in minutes
 });

const schema = { //60%
  date_created: { type: Date, default: Date.now },
  id: Number,
  collar_mac_id: String,
  service_uuid: String, //?
  owners: [Number],
  name: String,
  description: String,
  avatar: String,
  visited_gardens: [Object], // [visitedGardenSchema]
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
    size: Number, //1 small, 2 big
    howMuchExercise: Number
    
  },
  character_params: {
    energy_level: Number,     //size 1-3      ///m deviation of 1   60%
    avg_play_time: Number,
    playfullness: Boolean,                   ///m                  60%
    park_preference: Number    //1 empty, 2 crowded, 3 both
  },
}
const dogs_schema = new mongoose.Schema(schema)
const Dog = mongoose.model('dog', dogs_schema)
const visitedGarden = mongoose.model('visitedGarden', visitedGardenSchema)

module.exports =  {
  Dog,
  visitedGarden }
