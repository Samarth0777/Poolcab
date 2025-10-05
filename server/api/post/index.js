const express = require("express")
const router = express.Router()
const nodemailer=require('nodemailer')

const Post = require("../../models/post")
const User = require("../../models/user")

const authMiddleware = require("../../middleware/authmiddleware")
const adminMiddleware = require("../../middleware/adminMiddleware")

router.post("/postride", authMiddleware, async (req, res) => {
    console.log("REQ BODY:", req.body); // Add this line
    // res.status(200).json({ message: "Not implemented yet" });
    const {username, firstName, lastName, contact, vehicle, to, from, seats, totalSeats, date_time } = req.body
    if (!username|| !firstName || !lastName || !contact || !vehicle || !to || !from || !seats || !totalSeats|| !date_time) {
        return res.status(400).json({ message: "All fields are required" })
    }
    const user = await User.findOne({username:username})
    try {
        const newPost = new Post({
            firstName:firstName,
            lastName:lastName,
            contact:contact,
            vehicle:vehicle,
            to:to,
            from:from,
            totalSeats:totalSeats,
            seats:seats,
            date_time:date_time
        })
        await newPost.save()
        user.postedRides.push(newPost._id)
        await user.save()
        res.status(201).json({ message: "Post created successfully", post: newPost })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/sendconfmail",async(req,res)=>{
    const {username,post}=req.body
    if(!username)
            return res.status(404).json({error:"Please provide username"})
        const user=await User.findOne({username})
    
        const transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'samarthsaxena0777@gmail.com',
                pass:'uehr dgse bizu fube'
            }
        })
        const emailBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">Hello ${user.firstName} ${user.lastName},</h2>
            <p>Your ride has been successfully posted on PoolCab. Here are the details of your ride:</p>
            <ul>
                <li><strong>From:</strong> ${post.from}</li>
                <li><strong>To:</strong> ${post.to}</li>
                <li><strong>Date & Time:</strong> ${new Date(post.date_time).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</li>
                <li><strong>Vehicle:</strong> ${post.vehicle}</li>
                <li><strong>Total Seats:</strong> ${post.totalSeats}</li>
                <li><strong>Available Seats:</strong> ${post.seats}</li>
                <li><strong>Contact:</strong> ${post.contact}</li>
            </ul>
            <p>Thank you for using PoolCab. We hope you have a great experience!</p>
            <br>
            <p>Best regards,</p>
            <p>The <strong>PoolCab</strong> Team</p>
        </div>
        `;
        try {
            await transporter.sendMail({
                from: '"POOLCAB samarthsaxena0777@gmail.com',
                to:user.email,
                subject:"Ride Posted!",
                html:emailBody
            })
            return res.status(200).json({msg:"Email Sent"})
            
        } catch (err) {
            console.error("Error Sending Mail:", err)
            return res.status(500).json({error:"Internal server error"})
        }
})

router.get("/getrides", authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find()
        return res.status(200).json({ posts })
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" })
    }

})

router.post("/bookride", authMiddleware, async (req, res) => {
    const { username, bookedSeats, _id } = req.body;

    try {
        const post = await Post.findOne({ _id });
        const user = await User.findOne({ username });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { firstName, lastName } = user;

        if (post.seats < bookedSeats || bookedSeats <= 0) {
            return res.status(406).json({ message: "Invalid Number of Seats Selected" });
        }

        post.seats -= bookedSeats;

        if (!post.bookedBy) post.bookedBy = [];
        if (!user.bookedRides) user.bookedRides = [];

        let postfound = false;
        const x = Number(bookedSeats);
        for (let i = 0; i < post.bookedBy.length; i++) {
            if (post.bookedBy[i].username === username) {
                post.bookedBy[i].bookedSeats += x;
                postfound = true;
                break;
            }
        }
        let userfound = false;
        for (let i = 0; i < user.bookedRides.length; i++) {
            if (user.bookedRides[i]._id.toString() === _id) {
                user.bookedRides[i].bookedSeats += x;
                userfound = true;
                break;
            }
        }
        if (!postfound)
            post.bookedBy.push({ username, firstName, lastName, bookedSeats: x });
        if (!userfound)
            user.bookedRides.push({ _id, bookedSeats: x });

        await post.save();
        await user.save();

        res.status(200).json({ message: "Ride booked successfully", post, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/adminupdate",adminMiddleware,authMiddleware, async(req,res)=>{
    const {_id,firstName,lastName,contact,to,from,date_time,seats}=req.body
    try {
        const post=await Post.findById(_id)
        // return res.status(200).json(post)
        const updatedPost=await Post.findByIdAndUpdate(
            _id,
            {
                $set:{firstName,lastName,contact,to,from,date_time,seats}
            },
            {new:true}
        )
        res.status(200).json({success:true,msg:"Post updated successfullt",post:updatedPost})
    } catch (error) {
        console.log("Internal Server Error")
        res.status(500).json({err:"Internal Server Error"})
    }
})

module.exports = router