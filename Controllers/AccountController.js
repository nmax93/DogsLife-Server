const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const system_data = require('../Schemas/SystemDataSchema')
const account = require('../Schemas/AccountSchema')
const user = require('../Schemas/UserSchema')

module.exports = {
  login(req, res, next) { //res: if wrong password => { err: '...'} | if correct => { profile: {profile}, token: '...', err: ''}
    mongoose.connect(url, options).then(() => {
      account.findOne({ username: req.body.username, password: req.body.password }, (err, result) => { //check if username exists
        if (err) { console.log(`err: ${err}`) }
        else if (!result) {
          console.log(`wrong password`)
          res.json({ err: 'Wrong password' })
        }
        else {
          let token
          if (result.token === '') {
            token = generateToken(result)
          }
          else {
            token = result.token
          }
          user.findOne({ id: result.profile_id }, (err, result) => { //response user his profile and token
            if (err) { console.log(`err: ${err}`) }
            const responseObject = {
              profile: result,
              token: token,
              err: '',
            }
            res.json(responseObject)
            console.log(`returned user profile with token`)
          })
        }
      })
    },
      err => { console.log(`connection error: ${err}`) })
  },

  register(req, res, next) {
    mongoose.connect(url, options).then(() => {
      account.findOne({ username: req.body.username }, (err, result) => { // check if username exists
        if (err) { console.log(`err: ${err}`) }
        if (result) { console.log(`username already exists`) }
        else {
          system_data.findOne({}, (err, result) => { // get last user id used
            if (err) { console.log(`err: ${err}`) }
            increamentUserIdCounter(result)
            createNewAccount(req.body.username, req.body.password, result.last_user_id + 1)
          })
        }
      })
    },
      err => { console.log(`connection error: ${err}`) })
  },
}
//FUNCTIONS OUTSIDE MODULE.EXPORTS

function generateToken(userAccount) {
  let token = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < 8; i++) {
    token += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  //update user account with active token
  updatedAccountWithToken = {
    username: userAccount.username,
    password: userAccount.password,
    profile_id: userAccount.profile_id,
    token: token
  }
  account.updateOne({ username: userAccount.username, password: userAccount.password }, updatedAccountWithToken, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    else { console.log(`updated account with token: ${token}`) }
  })

  return token
}

function increamentUserIdCounter(systemObject) { //update in db user id counter + 1
  const updatedSystemObject = {
    last_user_id: systemObject.last_user_id + 1,
    last_dog_id: systemObject.last_dog_id,
    last_garden_id: systemObject.last_garden_id
  }
  system_data.updateOne({}, updatedSystemObject, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    else { console.log(`updated user id counter`) }
  })
}

function createNewAccount(username, password, id) {
  const newAccount = {
    username: username,
    password: password,
    user_profile: id
  }
  account.create(newAccount, (err, result) => {
    if (err) {
      console.log(`err: ${err}`)
    }
    else {
      console.log(`added new Account: ${newAccount}`)
      createNewUserProfile(result.user_profile)
    }
  })
}

function createNewUserProfile(id) {
  const newUser = {
    id: id,
    private: false,
    name: "",
    age: -1,
    gender: "",
    avatar: "",
    dogs: [],
    preferences: {
      dogs: {
        breads: [],
        min_weight: -1,
        max_weight: -1
      },
      owners: {
        gender: "",
        min_age: -1,
        max_age: -1
      }
    },
    owner_matches: [],
    dog_matches: []
  }

  user.create(newUser, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    else {
      console.log(`created new user: ${result}`)
      mongoose.disconnect()
    }
  })
}
