const express=require("express")
const user = require("../models/user")
const router=express.Router()

router.get("/",(req,res)=>{
    res.send("Test API is working")
})

router.post("/a",(req,res)=>{
    res.send("working")
})

router.get("/all",async(req,res)=>{
    try {
        const users=await user.find()
        return res.status(200).json({users})
    } catch (error) {
        console.log("Internal Server Error",error)
        return res.status(500).json({err:"Internal Server Error"})
    }
})
module.exports=router