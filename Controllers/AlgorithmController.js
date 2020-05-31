const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const { User } = require('../Schemas/UserSchema')
const Dog = require('../Schemas/DogSchema')
const { Garden } = require('../Schemas/GardenSchema')
const Match = require('../Schemas/MatchSchema')
const Area = require('../Schemas/AreaSchema')

module.exports = {
  // Ignore dogs for the same owner!!!!!
  createDogMatch(req, res, next) { // params: my dog id, matched dog id array
    console.log("createDogMatch -> req.body", req.body)
    let i, newMatch
    mongoose.connect(url, options).then(() => {
      //get owner of the dog
      Dog.findOne({ collar_mac_id: req.body.my_dog_id }, (err, result) => {
        if (err) { console.log(`err: ${err}`) }
        if (!result) {
          console.log(`createDogMatch -> no dog found`)
          res.sendStatus(404)
          return
        }
        let ownerID = result.owner
        console.log("createDogMatch -> ownerID", ownerID)
        console.log("createDogMatch -> req.body.matched_dogs_ids.length", req.body.matched_dogs_ids.length)
        const matchedDogs = req.body.matched_dogs_ids
        for (i = 1; i <= matchedDogs.length; i++) {
          if (matchedDogs[i] > 0) {
            console.log("matched dog", matchedDogs[i])

            newMatch = matchedDogs[i]
            console.log("createDogMatch -> newMatch", newMatch)
            // add match to owner
            // dont update dogs of the same owner
            User.updateOne({ id: ownerID }, { $push: { dog_matches: newMatch } }, (err, result) => {
              if (err) {
                console.log(`err: ${err}`)
                res.sendStatus(404).send("cant update dog_matches ") // 

              }
              //if (result) {
              //console.log(`created match [i]${newMatch},${i}`)
              //}
            })
          }
        }
      })
    })
      .catch(e => {
        console.log("cant connect to mongo in createDogMatch", e)
      })
    //mongoose.disconnect()
    res.sendStatus(200)
  },

  Matcher(req, res, next) {
    mongoose.connect(url, options).then(() => {
      Garden.find({}, (err, gardens) => { //find all gardens
        if (err) { console.log(`err: ${err}`) }
        if (!gardens) {
          console.log(`Matcher -> no gardens found`)
          return
        }
        gardens.forEach(garden => {
          Dog.find({ id: { $in: garden.todays_dog_visitors } }, (err, dogs) => {
            if (err) { console.log(`err: ${err}`) }
            if (!dogs) {
              console.log(`Matcher -> no visitors today - garden no.${garden.id}`)
              return
            }
            User.find({ id: { $in: garden.todays_dog_visitors_owners } }, (err, owners) => {
              if (err) { console.log(`err: ${err}`) }
              matchingFunction(dogs, owners)
            })
          })
        })
      })
      res.sendStatus(200)
    },
      err => { console.log(`connection error: ${err}`) }
    )
  },

  distanceMatcher(req, res, next) {
    mongoose.connect(url, options).then(() => {
      Area.find({}, (err, areas) => {
        if (err) { console.log(`err: ${err}`) }
        areas.forEach(area => {
          const users = area.users
          for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
              if (distance(users[i], users[j]) <= 1) {
                User.updateOne({ id: users[i].id }, { $push: { nearby_users: users[j].id } }, (err, result) => {
                  if (err) { console.log(`err: ${err}`) }
                  console.log(`user ${users[i].id} near user ${users[j].id}`)
                })
                User.updateOne({ id: users[j].id }, { $push: { nearby_users: users[i].id } }, (err, result) => {
                  if (err) { console.log(`err: ${err}`) }
                  console.log(`user ${users[j].id} near user ${users[i].id}`)
                })
              }
            }
          }
        })
      })
      res.sendStatus(200)
    },
      err => { console.log(`connection error: ${err}`) }
    )
  }
}

//FUNCTIONS OUTSIDE MODULE.EXPORTS
function matchingFunction(dogs, owners) {
  const newMatches = []
  for (let i = 0; i < dogs.length; i++) { // foreach dog i
    for (let j = i + 1; j < dogs.length; j++) { // and dog j
      // check if dogs match. if not, continue to the next dog. if yes, check owners
      const dogs_match_grade = checkIfDogsMatch(dogs[i], dogs[j])
      if (dogs_match_grade < 60)
        continue

      // else continue by checking owners
      for (let k = 0; k < dogs[i].owners.length; k++) { // foreach owner of dog i
        for (let l = 0; l < dogs[j].owners.length; l++) { // foreach owner of dog j
          // check if dog i and owner k MATCH dog j and owner l
          const owner1 = owners.find(({ id }) => id === dogs[i].owners[k])
          const owner2 = owners.find(({ id }) => id === dogs[j].owners[l])
          // check if owners match. if yes, create match
          const owners_match_grade = checkIfOwnersMatch(owner1, owner2)
          if (owners_match_grade >= 60) {
            const matchID = generateMatchID(dogs[i].id, dogs[i].owners[k], dogs[j].id, dogs[j].owners[l])
            const match_object = {
              id: Number(matchID),
              grade: dogs_match_grade * 0.6 + owners_match_grade * 0.4
            }
            newMatches.push(match_object)
          }
        }
      }
    }
  }
  sendMatchesToUsers(newMatches)
}

function checkIfDogsMatch(dog1, dog2) {
  // first check if the dogs are dangerous to each other
  // check for gender compability
  if (dog1.get_along.gender !== 3 || dog2.get_along.gender !== 3) { // 3 = get along with both genders
    if ((dog1.get_along.gender !== dog2.physical_params.gender) || (dog2.get_along.gender !== dog1.physical_params.gender)) {
      return 0
    }
  }
  // check for spayed compability
  if (dog1.get_along.spayed !== 3 || dog2.get_along.spayed !== 3) { // 3 = get along with both spayed and not spayed
    if ((dog1.get_along.spayed !== dog2.physical_params.spayed) || (dog2.get_along.spayed !== dog1.physical_params.spayed)) {
      return 0
    }
  }
  // check for size compability
  if (dog1.get_along.size !== 3 || dog2.get_along.size !== 3) { // 3 = get along with both big and small
    if ((dog1.get_along.size !== dog2.physical_params.size) || (dog2.get_along.size !== dog1.physical_params.size)) {
      return 0
    }
  }
  let grade = 0
  // check if the dog match good enough (60% +)
  if (dog1.character_params.playfullness === dog2.character_params.playfullness) {
    grade += 60
  }
  if (Math.abs(dog1.character_params.energy_level - dog2.character_params.energy_level) <= 1) {
    grade += 60
  }
  if (grade >= 100) return 100
  if (dog1.physical_params.breed === dog2.physical_params.breed) {
    grade += 10
  }

  return grade
}

function checkIfOwnersMatch(owner1, owner2) {
  let grade = 0
  // check for at least 1 mutual hobbie
  for (let i = 0; i < owner1.hobbies.length; i++) {
    if (owner1.hobbies[i] === owner2.hobbies[i]) {
      grade += 30
      break
    }
  }
  // check for at least 1 mutual hangout place
  for (let i = 0; i < owner1.hangouts.length; i++) {
    if (owner1.hangouts[i] === owner2.hangouts[i]) {
      grade += 30
      break
    }
  }
  if (grade === 0) return 0
  // check for mutual walk routine and deviation of 10 minutes
  if (owner1.walk_routine.morning.duration > 0 && owner2.walk_routine.morning.duration > 0) {
    if (owner1.walk_routine.morning.type === owner2.walk_routine.morning.type) {
      grade += 10
      if (Math.abs(owner1.walk_routine.morning.duration - owner2.walk_routine.morning.duration) <= 10)
        grade += 10
    }
  }
  else if (owner1.walk_routine.midday.duration > 0 && owner2.walk_routine.midday.duration > 0) {
    if (owner1.walk_routine.midday.type === owner2.walk_routine.midday.type) {
      grade += 10
      if (Math.abs(owner1.walk_routine.midday.duration - owner2.walk_routine.midday.duration) <= 10)
        grade += 10
    }
  }
  else if (owner1.walk_routine.afternoon.duration > 0 && owner2.walk_routine.afternoon.duration > 0) {
    if (owner1.walk_routine.afternoon.type === owner2.walk_routine.afternoon.type) {
      grade += 10
      if (Math.abs(owner1.walk_routine.afternoon.duration - owner2.walk_routine.afternoon.duration) <= 10)
        grade += 10
    }
  }
  else if (owner1.walk_routine.evening.duration > 0 && owner2.walk_routine.evening.duration > 0) {
    if (owner1.walk_routine.evening.type === owner2.walk_routine.evening.type) {
      grade += 10
      if (Math.abs(owner1.walk_routine.evening.duration - owner2.walk_routine.evening.duration) <= 10)
        grade += 10
    }
  }
  // check for mutual number of dogs
  if (owner1.number_of_dogs === owner2.number_of_dogs) grade += 10
  // check for mutual people dog is raised with (family/ partner ....)
  if (owner1.raise_with === owner2.raise_with) grade += 10

  return grade
}

function generateMatchID(i, j, k, l) {
  const id = '' + i + k + j + l
  return id
}

function sendMatchesToUsers(matches) {
  matches.forEach(match => {
    Match.findOne({ id: match.id }, (err, result) => { //check if match exists from before
      if (err) { console.log(`err: ${err}`) }
      if (!result) {
        const matchStr = '' + match.id
        const dog1 = Number(matchStr[0])
        const dog2 = Number(matchStr[1])
        const user1 = Number(matchStr.substring(2, 5))
        const user2 = Number(matchStr.substring(5, 7))
        User.updateOne({ id: user1 }, { $push: { matches: dog2 } }, (err, result) => {
          if (err) { console.log(`err: ${err}`) }
        })
        User.updateOne({ id: user2 }, { $push: { matches: dog1 } }, (err, result) => {
          if (err) { console.log(`err: ${err}`) }
        })
        console.log(match.id + " " + match.grade)
      } else {
        console.log(`match id ${match.id} already exists`)
      }
    })
  })
}

function distance(user1, user2) {
  const lat1 = user1.coords.lat
  const lon1 = user1.coords.lon
  const lat2 = user2.coords.lat
  const lon2 = user2.coords.lon
  const p = 0.017453292519943295    // Math.PI / 180
  const c = Math.cos
  const a = 0.5 - c((lat2 - lat1) * p) / 2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p)) / 2

  return 12742 * Math.asin(Math.sqrt(a)) // 2 * R; R = 6371 km
}