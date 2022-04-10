const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 4,
        required: true
    }
})

module.exports = new mongoose.model('User', schema)