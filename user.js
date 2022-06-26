const mongoose = require("mongoose");

const model = mongoose.Schema({
    Username: String,
    Email: String,
    Password: String,
    Interests: []
})

const user = mongoose.model("User",model);

module.exports = user;