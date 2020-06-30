const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const accountController = require('./Controllers/AccountController')
const matchController = require('./Controllers/MatchController')
const mapController = require('./Controllers/MapController')
const profileController = require('./Controllers/ProfileController')
const algorithmController = require('./Controllers/AlgorithmController')

app.use(bodyParser.json())
app.use(express.json())
const urlencodedParser = bodyParser.urlencoded({ extended: false })

//ACCOUNT
app.post('/register', accountController.register)
app.post('/login', accountController.login)
//PROFILE
app.post('/getUserProfile', profileController.getUserProfile)
app.post('/editUserProfile', profileController.editUserProfile)
app.post('/editDogProfile', profileController.editDogProfile)
app.post('/addDog', profileController.addDog)
app.post('/addSignupObject', profileController.addSignupObject)
app.post('/addNewUserToExistDog', profileController.addNewUserToExistDog)
//MATCH
app.post('/createDogMatch', urlencodedParser, matchController.createDogMatch)

app.post('/getMatches', matchController.getMatches)
//MAP
app.get('/getGardens', mapController.getGardens)
app.post('/getPresentDogsInGarden', mapController.getPresentDogsInGarden)
app.post('/dogsEnterGarden', urlencodedParser, mapController.dogsEnterGarden)
app.post('/addReview', mapController.addReview)
app.post('/getDogOwners', mapController.getDogOwners)
app.post('/getOwnerDogs', mapController.getOwnerDogs)
//ALGORITHM
app.post('/collarMatch', algorithmController.collarMatch)
app.get('/Matcher', algorithmController.Matcher)
app.get('/distanceMatcher', algorithmController.distanceMatcher)
app.get('/dogsAvgTimeInGardenUpdater', algorithmController.dogsAvgTimeInGardenUpdater)

app.listen(5050)
console.log('Server is running')