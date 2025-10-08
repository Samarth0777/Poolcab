const express=require('express');
const app=express();

const cookieParser=require('cookie-parser')

const cors=require('cors')

const port=process.env.PORT
const connectDB=require('./db/index')

const coreRouter=require('./api/index')
const BASE_URL=process.env.BASE_API_URL

app.use(cookieParser())

app.use(express.json());
connectDB()

app.use(cors({
    origin:'http://localhost:5173',
    methods:['GET','POST','PUT','DELETE'],
    credentials:true,
}))



app.use(BASE_URL,coreRouter)


app.get("/",(req,res)=>{
    res.send('Hello') 
}) 

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
}) 