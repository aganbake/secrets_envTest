//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash')
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const md5 = require('md5')

const app = express();

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect('mongodb://127.0.0.1:27017/userDB', {useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  });

// userSchema.plugin(encrypt, {secret:process.env.secret,excludeFromEncryption:['email']});


const User = mongoose.model('User', userSchema);

async function findUser(reqUsername, reqPassword) {
  const findUser = await User.findOne({ email: reqUsername });
  if (findUser.password === reqPassword) {
    return findUser;
  }
}

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/logout", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password),
  });

  newUser.save();

  res.render('secrets');

});

app.post("/login",function(req, res){
    const userName = req.body.username;
    const userPassword = md5(req.body.password);
    

    findUser(userName,userPassword).then(function(foundUser){
        if(foundUser.email === userName && foundUser.password === userPassword){
            res.render('secrets');
        }else{
            res.render('login');
        }
    })
})
// app.get("/secrets", function (req, res) {
//   res.render("secrets");
// });

// app.get("/submit", function (req, res) {
//   res.render("submit");
// });


app.post('/', function(req, res){
//res.send('');
//res.sendFile('__dirname+/file.html');


});


app.listen(3000, function(){
console.log('Server started on port 3000');
});