const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const account = require('../Schemas/AccountSchema')
const system_data = require('../Schemas/SystemDataSchema')
const { user } = require('../Schemas/UserSchema')
const dog = require('../Schemas/DogSchema')
const accountController = require('./AccountController')

module.exports = {
  editUserProfile(req, res, next) { //params: id, token, private, name, age, gender,avatar, preferences
    mongoose.connect(url, options).then(() => {
      accountController.authenticateUser(req.body.id, req.body.token, () => { //auth
        user.findOne({ id: req.body.id }, (err, result) => {
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
            err: '',
          }
          user.updateOne({ id: req.body.id }, updatedUserProfile, (err, result) => {
            if (err) { console.log(`err: ${err}`) }
            else {
              console.log(`updated user profile: ${result}`)
              mongoose.disconnect()
            }
          })
        })
      })
    },
      err => { console.log(`connection error: ${err}`) })
  },

  addDog(req, res, next) { //params: token, ownerId, name, age, weight, bread, avatar
    mongoose.connect(url, options).then(() => {
      accountController.authenticateUser(req.body.userId, req.body.token, () => { //auth
        system_data.findOne({}, (err, result) => { //get last dog id used
          if (err) { console.log(`err: ${err}`) }
          increamentDogIdCounter(result)
          createNewDogProfile(result.last_dog_id + 1, req.body.userId, req.body.name, req.body.age, req.body.bread, req.body.weight, req.body.avatar)
          addDogToUserDogsArray(req.body.userId, result.last_dog_id + 1)
        })
      })
    },
      err => { console.log(`connection error: ${err}`) })
  },

  editDogProfile(req, res, next) {
    mongoose.connect(url, options).then(() => {
      accountController.authenticateUser(req.body.userId, req.body.token, () => { //auth
        dog.findOne({ id: req.body.dogId }, (err, result) => { // find dog
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
          dog.updateOne({ id: req.body.dogId }, updatedDogProfile, (err, result) => { // update dog
            if (err) { console.log(`err: ${err}`) }
            else {
              console.log(`updated dog profile: ${result}`)
              res.sendStatus(200)
              mongoose.disconnect()
            }
          })
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

function createNewDogProfile(id, ownerId, name, age, bread, weight, avatar) {
  const newDog = {
    id: id,
    service_uuid: '', //???????????
    mac_id: '', //???????????
    owner: ownerId,
    name: name,
    age: age,
    bread: bread,
    weight: weight,
    other_owners: [],
    avatar: avatar
  }
  dog.create(newDog, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    else {
      console.log(`added new dog: ${result}`)
    }
  })
}

function addDogToUserDogsArray(userId, dogId) {
  user.updateOne({ id: userId }, { $push: { dogs: dogId } }, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    console.log(`added dog ${dogId} to user ${userId}`)
  })
}