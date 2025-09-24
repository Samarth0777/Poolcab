const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    vehicle: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    totalSeats:{
        type: Number,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    date_time: {
        type: String,
        required: true
    },
    bookedBy: [
        {
            username: String,
            firstName: String,
            lastName: String,
            bookedSeats: Number
        }
    ]
})

module.exports = mongoose.model("Post", schema)