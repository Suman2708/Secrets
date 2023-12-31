//jshint esversion:6


require('dotenv').config() // -----> this is for creating a file which will be invisible after making repository
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");




// ------>   this is for hashing the password in database <------
// const md5=require("md5");


// this is for making the password more secure than by using md5 as it hash the password by adding hash of some random numbers
// which is salt rounds
// const bcrypt= require("bcrypt");
// const saltRounds = 10;



const session = require('express-session');
const passport= require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')



// const encrypt=require("mongoose-encryption");
const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
   secret :"our little secret.",
   resave:false ,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

 mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
 const userSchema = new mongoose.Schema ({
    email:String,
    password:String,
    googleId : String
 });


//  userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ["password"]  });

// ////////////////////or///////////////////////////

// const userSchema={
//     email:{type: String,require:true},
//     password:{type:String,require:true}
// }

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/",function(req,res){
    res.render("home");
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] }));

  app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/register",function(req,res){
    res.render("register");
})

// app.post("/register",function(req,res){

//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        
//         const newuser=new User({
//             email: req.body.username,
//             password:hash
//         });
//         newuser.save().then(()=>{
//             res.render("secrets");
//         }).catch((e)=>{
//                res.send("error while saving data"); 
//         })
//     });
    
//     });




// app.post("/login",function(req,res){
//     const username=req.body.username;
//     const password=(req.body.password);

//     User.findOne({email:username}).then((founduser)=>{
//         bcrypt.compare(password, founduser.password, function(err, result) {
//             if(result===true){
//                  res.render("secrets")
//             } 
//             else{
//             res.render("register");
//         }
//         });
//         // if(founduser.password===password){
           
//         // }
       
//     }).catch((e)=>{
//         res.render("register");
//         console.log(e);
//     })
// })


app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("login");
    }
});



app.post("/register",function(req,res){
    var newUser = new User({username: req.body.username});

        User.register(newUser,req.body.password,function(err,user){
            if(err){
                console.log(err);
                res.redirect("register");
            }else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("secrets");
                })
            }
        })
    });



  
    app.post("/login",function(req,res){
       
    })
    










app.listen(3000,function(req,res){
    console.log("Server started on port 3000");
})
