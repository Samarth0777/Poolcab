const express=require("express")
const User = require("../../models/user")
const Post=require("../../models/post")
const authMiddleware = require("../../middleware/authmiddleware")
const adminMiddleware=require("../../middleware/adminMiddleware")
const router=express.Router()

router.post("/register",async(req,res)=>{
    const {firstName,lastName,email,password,username}=req.body
    if(!firstName || !lastName || !email || !password || !username){
        return res.status(400).json({error:"Please fill all fields"})
    }
    if(await User.findOne({username}))
        return res.status(400).json({error:"Username already exists"}   )
    if(await User.findOne({email}))
        return res.status(400).json({error:"Email already exists"})
    try {
        const created_user=await User.create({
            firstName,
            lastName,
            email,
            password,
            username
        })
        return res.status(201).json({success:true,message:"User registered successfully",user:created_user})
    } catch (error) {
        console.error("Error in registration:", error)
        return res.status(500).json({error:"Internal server error"})
    }
})

router.post("/login",async(req,res)=>{
    const {username,password}=req.body
    if(!username || !password){
        return res.status(400).json({error:"Please fill all fields"})
    }
    try {
        const user=await User.findOne({username})
        if(!user)
            return res.status(404).json({error:"User not found"})
        if(password!==user.password)
            return res.status(401).json({error:"Invalid credentials"})
        return res.status(200).json({success:true,message:"User logged in successfully",user,token:await user.generateToken()})
    } catch (err) {  
        console.error("Error in login:", err)
        return res.status(500).json({error:"Internal server error"})
    }
})

router.get("/checkauth",authMiddleware,async(req,res)=>{
    return res.status(200).json({success:true,message:"User is authenticated"})

})

router.put("/updateprofile",authMiddleware,async(req,res)=>{
    const {username,firstName,lastName,email,contact,currentAdd,vehicle}=req.body
    const avlVehicle=vehicle
    try {
        // console.log("Update profile request body:", req.body);
        const user=await User.findOne({username:username})
        console.log(user)
        const updatedUser=await User.findByIdAndUpdate(
            user._id,
                {
                $set:{
                    firstName,lastName,email,contact,currentAdd,avlVehicle
                }
                },
            {new:true}
        )
        return res.status(200).json({success:true,message:"Profile updated successfully",user:updatedUser})
    } catch (err) {
        return res.status(500).json({error:"Internal server error"})
    }
})

router.post("/getbookedrides",authMiddleware,async(req,res)=>{
    const {username}=req.body
    try {
        const user=await User.findOne({username})
        if(!user)
            return res.status(404).json({error:"User not found"})
        const bookedRides=user.bookedRides
        const detailedRides=[]
        for(const ride of bookedRides){
            const rideDetails=await Post.findById(ride._id)
            const seats=ride.bookedSeats
            detailedRides.push({rideDetails,seats})
        }
        return res.status(200).json({success:true,bookedRides:detailedRides})
    } catch (err) {
        console.error("Error in fetching booked rides:", err)
        return res.status(500).json({error:"Internal server error"})
    }
})

router.post("/getpostedrides",authMiddleware,async(req,res)=>{
    const {username}=req.body
    try {
        const user=await User.findOne({username})
        if(!user)
            return res.status(404).json({error:"User not found"})
        const postedRides=user.postedRides
        const detailedRides=[]
        for(const rideId of postedRides){
            const rideDetails=await Post.findById(rideId)
            detailedRides.push(rideDetails)
        }
        return res.status(200).json({success:true,postedRides:detailedRides})
    } catch (err) {
        console.error("Error in fetching posted rides:", err)
        return res.status(500).json({error:"Internal server error"})
    }
})

router.post("/getalluser",adminMiddleware,authMiddleware, async(req,res)=>{
    // console.log("all user called")
    // res.status(200)
    try {
        const users=await User.find()
        return res.status(200).json({users})
    } catch (error) {
        console.log("Internal Server Error",error)
        return res.status(500).json({err:"Internal Server Error"})
    }
})

router.post("/adminblockuser",adminMiddleware,authMiddleware,async(req,res)=>{
    const {username,_id}=req.body
    const isBlocked=true
    try {
        const updatedUser=await User.findByIdAndUpdate(
            _id,
            {
                $set:{isBlocked}
            },
            {new:true}
        )
        return res.status(200).json({msg:"user blocked successfully",updatedUser})
    } catch (error) {
        return res.status(500).json({err:"Interna, Server Error!"})
    }
})

router.post("/adminunblockuser",adminMiddleware,authMiddleware,async(req,res)=>{
    const {username,_id}=req.body
    const isBlocked=false
    try {
        const updatedUser=await User.findByIdAndUpdate(
            _id,
            {
                $set:{isBlocked}
            },
            {new:true}
        )
        return res.status(200).json({msg:"user unblocked successfully",updatedUser})
    } catch (error) {
        return res.status(500).json({err:"Interna, Server Error!"})
    }
})

module.exports=router 