const express = require("express");
const mongoose = require("mongoose");
const user = require("./user");
const cookie = require('cookie-parser');
const session = require('express-session');
const spawn = require("child_process").spawn;
const app = express();
const bcrypt = require('bcryptjs');
app.use(cookie('cookie'));
app.set('view engine', 'ejs');
app.set('views', 'views');
let {PythonShell} = require('python-shell');
const e = require("express");
// const { isErrored } = require("stream");
// const { isAnyArrayBuffer } = require("util/types");
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/assets'));
app.use(session({
    session:"testing",
    resave: true,
    saveUninitialized: true    
}));

mongoose.connect("",{useNewUrlParser: true, useUnifiedTopology: true})
.catch(e=>{
    console.log(e)
})

app.get("/",async(req,res)=>{
    res.render("home.ejs")
})

app.get("/login",(req,res)=>{
    res.render("login.ejs");
})


app.post("/login",async(req,res)=>{
    try{
    console.log(req.body);
    const usah = await user.findOne({Email:req.body.Email});
    const hash = bcrypt.compare(usah.Password,req.body.Password);
    if(hash){
        req.session.user_id = usah._id
        console.log(req.session.user_id);
        res.redirect("/");
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
    console.log(req.session.user_id)
    if(req.session.user_id !== null){
        const usah = await user.findById(req.session.user_id)
        res.render("profile.ejs",{profile: usah})
    }
    else{
        res.redirect("/register")
    }
})

app.get("/find",async(req,res)=>{
    res.render("engine.ejs");
})
app.post("/engine",async(req,res)=>{
    console.log(req.body)
    const find = new PythonShell("./script.py");    
    await find.send([req.session.user_id,req.body.Purpose,req.body.Age, req.body.State]);
    await find.on('message', async function (message) {
    });
    await find.end(function (err) {
    if(err){
        console.log(err);
    }
    });
    res.redirect("/");
    });

app.post("/button/:name",async(req,res)=>{
    if(req.params.name === "all"){
     await user.updateOne({_id: req.session.user_id},{$set: {Interests: null}})
    }
    else{
        const usah = await user.findById(req.session.user_id);
        const interests = usah.Interests
        let new_interests = [];
    for(stuff of interests){
        if(stuff.event_name === req.params.name){
            console.log("Deleted")
        }
        else{
            new_interests.push(stuff)
        }
    }
    if(new_interests.length === 0){
        new_interests = null
    }
    await user.updateOne({_id: req.session.user_id},{$set: {Interests: new_interests}})
    }
    res.redirect("/profile");
})
app.get("/output",async(req,res)=>{
    // const usah = await user.findById(req.session.user_id)
    // const RawData = usah.Interests.replace("'",' ');
    // const Data = RawData.split(",")
    // console.log(Data[0])
});

app.post("/output",async(req,res)=>{
    console.log(req.body)
    const id = req.body[0]._id
    if(req.body.length === 0){
        await user.updateOne({_id: id},{$set: {Interests: null}})
    }
    else{
    await user.updateOne({_id: id},{$set: {Interests: req.body}})
    }
    // console.log(array);
    // console.log(array.length);
})

app.get("/info/:message",(req,res)=>{
    console.log(req.params);
})

app.post("/register",async(req,res)=>{
    const info = req.body;
    const hash = await bcrypt.hash(req.body.Password,12);
    const creden = new user({Username:info.Username,Email:info.Email,Password:hash,Interests: null});
    await creden.save();
    res.redirect("login");
})

app.get("*",(req,res)=>{
    res.redirect("/")
})

const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log("Starting")
});
