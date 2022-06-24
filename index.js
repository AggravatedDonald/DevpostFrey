const express = require("express");
const mongoose = require("mongoose");
const user = require("./user");
const cookie = require('cookie-parser');
const session = require('express-session');
const app = express();
const bcrypt = require('bcryptjs');
app.use(cookie('cookie'));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(session({
    session:"testing",
    resave: true,
    saveUninitialized: true    
}));

mongoose.connect("mongodb://localhost:27017/DevpostFrey",{useNewUrlParser: true, useUnifiedTopology: true})
.catch(e=>{
    console.log(e)
})

app.get("/",(req,res)=>{
    res.send("test");
})

app.get("/login",(req,res)=>{
    res.render("login.ejs");
})


app.post("/login",async(req,res)=>{
    try{
    const usah = await user.findOne({Email:req.body.Email});
    const hash = bcrypt.compare(usah.Password,req.body.Password);
    if(hash){
        req.session.user_id = usah._id
        console.log(req.session.user_id);
        res.redirect("/profile");
    }
    }
    catch(e){
        console.log(e);
        res.redirect("/register");
    }
})

app.get("/register",(req,res)=>{
    res.render("signup.ejs");
})

app.get("/logout",(req,res)=>{
  req.session.user_id = null;
  res.redirect("/");  
})
app.get("/profile",async(req,res)=>{
    if(req.session.user_id !== null){
        console.log(req.session.user_id)
        const usah = await user.findById(req.session.user_id)
        res.send("Hello " + usah.Username)
    }
    else{
        res.redirect("/register")
    }
})

app.post("/register",async(req,res)=>{
    const info = req.body;
    const hash = await bcrypt.hash(req.body.Password,12);
    const creden = new user({Username:info.Username,Email:info.Email,Password:hash});
    await creden.save();
    res.redirect("login");
})


app.listen("8000",()=>{
    console.log("Starting")
});