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

app.post('/isDogIdExist', profileController.isDogIdExist)

//MATCH
app.post('/getMatches', matchController.getMatches)
//MAP
app.get('/getGardens', mapController.getGardens)
app.post('/getPresentDogsInGarden', mapController.getPresentDogsInGarden)
app.post('/dogsEnterGarden', urlencodedParser, mapController.dogsEnterGarden)
app.post('/addReview', mapController.addReview)
app.post('/getDogOwners', mapController.getDogOwners)
app.post('/getOwnerDogs', mapController.getOwnerDogs)
//ALGORITHM
app.post('/createDogMatch', urlencodedParser, algorithmController.collarMatch)
app.get('/Matcher', algorithmController.Matcher)
app.get('/distanceMatcher', algorithmController.distanceMatcher)
app.get('/dogsAvgTimeInGardenUpdater', algorithmController.dogsAvgTimeInGardenUpdater)

const port = 5050;
app.listen(port, () => console.log(`Server started on port ${port}`))
