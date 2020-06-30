const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const { User } = require('../Schemas/UserSchema')
const { Dog } = require('../Schemas/DogSchema')
const accountController = require('./AccountController')

module.exports = {
  getMatches(req, res, next) { //params: userId, token
    mongoose.connect(url, options).then(() => {
      accountController.authenticateUser(req.body.userId, req.body.token, () => { //auth
        User.findOne({ id: req.body.userId }, (err, userProfile) => { //find user
          if (err) { console.log(`err: ${err}`) }

          const matches = { systemMatches: [], geoMatches: [], collarMatches: [] } //return object

          // SYSTEM MATCHES GENERATION

          const systen_match_dogs = []
          const system_match_owners = []
          const system_match_grades = []
          userProfile.matches.forEach(match => {
            systen_match_dogs.push(match.dog)
            system_match_owners.push(match.user)
            system_match_grades.push(match.grade)
          })
          User.find({ id: { $in: system_match_owners } }, (err, ownerProfiles) => { //get matched owners profile
            if (err) { console.log(`err: ${err}`) }
            Dog.find({ id: { $in: systen_match_dogs } }, (err, dogProfiles) => { //get matched dogs profile
              if (err) { console.log(`err: ${err}`) }
              for (let i = 0; i < system_match_owners.length; i++) { // pare the dog and its owner into 1 object
                const owner = ownerProfiles.find(({ id }) => id === system_match_owners[i])
                const dog = dogProfiles.find(({ id }) => id === systen_match_dogs[i])
                const match = prepareMatchObject(owner, dog, system_match_grades[i])
                matches.systemMatches.push(match)
              }

              //GEO MATCHES GENERATION

              const geo_match_distance = []
              const geo_match_owners = []
              userProfile.geo_matches.forEach(match => {
                geo_match_distance.push(match.distance)
                geo_match_owners.push(match.user)
              })
              User.find({ id: { $in: geo_match_owners } }, (err, ownerProfiles) => { //get matched owners profile
                if (err) { console.log(`err: ${err}`) }
                for (let i = 0; i < geo_match_owners.length; i++) { // pare the distance and the owner into 1 object
                  const owner = ownerProfiles.find(({ id }) => id === geo_match_owners[i])
                  const match = prepareGeoMatchObject(owner, geo_match_distance[i])
                  matches.geoMatches.push(match)
                }
              })

                //COLLAR MATCHES GENERATION

                Dog.find({ id: { $in: userProfile.collar_matches } }, (err, dogProfiles) => { //get matched dogs profile
                  if (err) { console.log(`err: ${err}`) }
                  dogProfiles.forEach(dog => {
                    const match = prepareCollarMatchObject(dog)
                    matches.collarMatches.push(match)
                  })
                  console.log(`returned matches`)
                  res.json(matches)
                  mongoose.disconnect()
                })
            })
          })
        })
      })
    },
      err => { console.log(`connection error: ${err}`) }
    )
  },
}

//FUNCTIONS OUTSIDE MODULE.EXPORTS
function prepareMatchObject(owner, dog, grade) {
  const filtered_owner_profile = {
    id: owner.id,
    name: owner.name,
    avatar: owner.avatar,
  }
  const filtered_dog_profile = {
    id: dog.id,
    name: dog.name,
    avatar: dog.avatar
  }
  const match = { owner: filtered_owner_profile, dog: filtered_dog_profile, grade: grade }
  return match
}

//FUNCTIONS OUTSIDE MODULE.EXPORTS
function prepareMatchObject(owner, dog, grade) {
  const filtered_owner_profile = {
    id: owner.id,
    name: owner.name,
    avatar: owner.avatar,
  }
  const filtered_dog_profile = {
    id: dog.id,
    name: dog.name,
    avatar: dog.avatar
  }
  const match = { owner: filtered_owner_profile, dog: filtered_dog_profile, grade: grade }
  return match
}

function prepareGeoMatchObject(owner, distance) {
  const filtered_owner_profile = {
    id: owner.id,
    name: owner.name,
    avatar: owner.avatar,
  }
  const match = { owner: filtered_owner_profile, distance: distance }
  return match
}

function prepareCollarMatchObject(dog) {
  const filtered_dog_profile = {
    id: dog.id,
    name: dog.name,
    avatar: dog.avatar
  }
  return filtered_dog_profile
}