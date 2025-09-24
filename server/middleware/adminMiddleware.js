const adminMiddleware=async(req,res,next)=>{
    const {isAdmin}=req.body
    if(!isAdmin)
        return res.status(404).json({err:"No Admin Rights!"})
    console.log("Admin Rights!")
    next()
}

module.exports=adminMiddleware