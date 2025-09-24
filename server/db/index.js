const mongoose=require('mongoose')

const uri=process.env.MONGODB_URI

const connectDB=async()=>{
    try {
       await mongoose.connect(uri)
       console.log('Connected to MongoDB POOLCAB')
    } catch (error) {
        console.log('Error connecting to Mongodb',error)
    }
}

module.exports=connectDB