const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const System_data = require('../Schemas/SystemDataSchema')
const Account = require('../Schemas/AccountSchema')
const { User } = require('../Schemas/UserSchema')

module.exports = {
  login(req, res, next) { //res: if wrong password => { err: '...'} | if correct => { profile: {profile}, token: '...', err: ''}
    mongoose.connect(url, options).then(() => {
      Account.findOne({ username: req.body.username, password: req.body.password }, (err, result) => { //check if username exists
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
          User.findOne({ id: result.profile_id }, (err, result) => { //response user his profile and token
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
      Account.findOne({ username: req.body.username }, (err, result) => { // check if username exists
        if (err) { console.log(`err: ${err}`) }
        if (result) {
          console.log(`username already exists`)
          res.json({ err: `username already exists` })
        }
        else {
          System_data.findOne({}, (err, result) => { // get last user id used
            if (err) { console.log(`err: ${err}`) }
            increamentUserIdCounter(result)
            createNewAccount(req.body.username, req.body.password, result.last_user_id + 1)
            res.json({ err: '' })
          })
        }
      })
    },
      err => { console.log(`connection error: ${err}`) })
  },

  authenticateUser(userId, token, callback) {
    Account.findOne({ profile_id: userId, token: token }, (err, result) => { //auth
      if (err) { console.log(`err: ${err}`) }
      if (!result) {
        console.log(`token expired`)
        res.json({ err: 'token expired' })
        mongoose.disconnect()
        return
      }
      callback()
    })
  }
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
  Account.updateOne({ username: userAccount.username, password: userAccount.password }, updatedAccountWithToken, (err, result) => {
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
  System_data.updateOne({}, updatedSystemObject, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    else { console.log(`updated user id counter`) }
  })
}

function createNewAccount(username, password, id) {
  const newAccount = {
    username: username,
    password: password,
    profile_id: id,
    token: ''
  }
  Account.create(newAccount, (err, result) => {
    if (err) {
      console.log(`err: ${err}`)
    }
    else {
      console.log(`added new Account: ${newAccount}`)
      createNewUserProfile(id)
    }
  })
}

function createNewUserProfile(id) {
  const newUser = {
    id: id,
    name: '',
    age: -1,
    gender: false,
    avatar: '',
    dogs: [],
    matches: [],
    visited_gardens: [],
    hobbies: [false,false,false,false,false,false,false,false],
    walk_routine: {
      morning: { duration: -1, type: false },
      midday: { duration: -1, type: false },
      afternoon: { duration: -1, type: false },
      evening: { duration: -1, type: false }
    },
    hangouts: [false,false,false,false],
    number_of_dogs: 0,
    raise_with: 1,
    feeding_hours: { morning: -1, noon: -1, evening: -1 }
  }

  User.create(newUser, (err, result) => {
    if (err) { console.log(`err: ${err}`) }
    else {
      console.log(`created new user: ${result}`)
    }
  })
}
