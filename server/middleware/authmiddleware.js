const jwt=require("jsonwebtoken")
const key=process.env.JWT_SECRET

const authMiddleware=async(req,res,next)=>{
    // return res.status(401).json({error:'No token found'})
    var token=req.header('Authorization')
    token=token.replace('Bearer','').trim()
    if(!token)
        return res.status(401).json({error:'No token found'})
    try {
        const decoded=jwt.verify(token,key)
        req.user=decoded
        console.log("decoded user: ",req.user)
        next()
    } catch (error) {
        console.error("Error decoding token: ", error)
        return res.status(401).json({error:'Invalid token'})
    }
}

module.exports=authMiddleware