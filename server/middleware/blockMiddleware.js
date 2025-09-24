const blockMiddleware=async(req,res,next)=>{
    const {isBlocked}=req.body
    if(!isBlocked)
        return res.status(404).json({err:"Profile Blocked!"})
    console.log("Block Middleware passed!")
    next()
}

module.exports=blockMiddleware