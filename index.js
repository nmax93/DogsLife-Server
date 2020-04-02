var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const accountController = require('./Controllers/AccountController')
const matchController = require('./Controllers/MatchController')
const mapController = require('./Controllers/MapController')
const profileController = require('./Controllers/ProfileController')

app.use(bodyParser.json())
app.use(express.json())

//ACCOUNT
app.post('/register', accountController.register)
//PROFILE
app.get('/getUsers', profileController.getUsers)
app.post('/editUserProfile', profileController.editUserProfile)
app.post('/editDogProfile', profileController.editDogProfile)
app.post('/addDog', profileController.addDog)
//MATCH
app.post('/createDogMatch', matchController.createDogMatch)
app.post('/getMatches', matchController.getMatches)
//MAP
app.get('/getGardens', mapController.getGardens)
app.post('/getPresentDogsInGarden', mapController.getPresentDogsInGarden)
app.post('/dogEnterGarden', mapController.dogEnterGarden)
app.post('/dogExitGarden', mapController.dogExitGarden)

app.listen(5050)
console.log('Server is running')