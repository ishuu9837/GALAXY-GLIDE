const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        reuire: true,
    },
    image: {
        type: String
    }


}, {timestamps: true})

const User = mongoose.model('user', userSchema)

module.exports = User