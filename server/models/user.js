const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        default: ""
    },
    currentAdd: {
        type: String,
        default: ""
    },
    created: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    bookedRides: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            bookedSeats: Number
        }
    ],
    postedRides: {
        type: Array,
        default: []
    },
    avlVehicle: {
        type: Array,
        default: []
    }
})

schema.methods.generateToken = () => {
    try {
        const token = jwt.sign(
            {
                _id: this._id,
                username: this.username,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )
        console.log("Generated JWT:", token)
        return token;
    } catch (err) {
        console.log("Error generating token:", err)
    }
}

module.exports = mongoose.model("User", schema)
