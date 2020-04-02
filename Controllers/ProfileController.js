const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const system_data = require('../Schemas/SystemDataSchema')
const user = require('../Schemas/UserSchema')
const dog = require('../Schemas/DogSchema')

module.exports = {
  getUsers(req, res, next) {
    mongoose.connect(url, options).then(() => {
      user.find({}, (err, result) => {
        if (err) throw err
        console.log(result)
        res.json(result)
        mongoose.disconnect()
      })
    },
      err => { console.log(`connection error: ${err}`) }
    )
  },

  editUserProfile(req, res, next) {
    mongoose.connect(url, options).then(() => {
      user.findOne({ id: 110 }, (err, result) => { //????????????????????
        if (err) { console.log(`err: ${err}`) }
        updatedUserProfile = {
          id: result.id,
          private: req.body.private,
          name: req.body.name,
          age: req.body.age,
          gender: req.body.gender,
          avatar: req.body.avatar,
          dogs: result.dogs,
          preferences: req.body.preferences,
          owner_matches: result.owner_matches,
          dog_matches: result.dog_matches,
        }
        user.updateOne({ id: 110 }, updatedUserProfile, (err, result) => { //????????????????????
          if (err) { console.log(`err: ${err}`) }
          else {
            console.log(`updated user profile: ${result}`)
            mongoose.disconnect()
          }
        })
      })
    },
    err => { console.log(`connection error: ${err}`) })
  },

  addDog(req, res, next) { //params: name, age, weight, bread, avatar
    mongoose.connect(url, options).then(() => {
      system_data.findOne({}, (err, result) => { //get last dog id used
        if (err) { console.log(`err: ${err}`) }
        increamentDogIdCounter(result)
        createNewDogProfile(result.last_dog_id + 1, req.body.name, req.body.age, req.body.bread, req.body.weight, req.body.avatar)
      })
    },
    err => { console.log(`connection error: ${err}`) })
  },

  editDogProfile(req, res, next) {
    mongoose.connect(url, options).then(() => {
      dog.findOne({ id: 208 }, (err, result) => { //????????????????????
        if (err) { console.log(`err: ${err}`) }
        updatedDogProfile = {
          id: result.id,
          owner: result.owner,
          other_owners: result.other_owners,
          name: req.body.name,
          age: req.body.age,
          bread: req.body.bread,
          weight: req.body.weight,
          avatar: req.body.avatar
        }
        dog.updateOne({ id: 208 }, updatedDogProfile, (err, result) => { //????????????????????
          if (err) { console.log(`err: ${err}`) }
          else {
            console.log(`updated dog profile: ${result}`)
            mongoose.disconnect()
          }
        })
      })
    },
    err => { console.log(`connection error: ${err}`) })
  }
}
//  FUNCTIONS OUTSIDE MODULE.EXPORTS

function increamentDogIdCounter(systemObject) { //update in db dog id counter + 1
  const updatedSystemObject = {
    last_user_id: systemObject.last_user_id,
    last_dog_id: systemObject.last_dog_id + 1,
    last_garden_id: systemObject.last_garden_id
  }
  system_data.updateOne({}, updatedSystemObject, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    else { console.log(`updated last dog id`) }
  })
}

function createNewDogProfile(id, name, age, bread, weight, avatar) {
  const newDog = {
    id: id,
    owner: 0, //??????????????
    name: name,
    age: age,
    bread: bread,
    weight: weight,
    other_owners: [0, 0, 0], //??????????????????
    avatar: avatar
  }
  dog.create(newDog, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    else {
      console.log(`added new dog: ${result}`)
      mongoose.disconnect()
    }
  })
}