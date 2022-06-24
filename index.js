const express = require("express");
const mongoose = require("mongoose");
const cookie = require('cookie-parser');
const session = require('express-session');
const app = express();
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
app.get("/",(req,res)=>{
    res.send("test");
})

app.listen("8000",()=>[

]);