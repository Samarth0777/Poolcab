const express=require('express');
const router=express.Router();

const userRouter=require('./user/index')
const postRouter=require('./post/index')
const testRouter=require('./test')

router.use('/user',userRouter)

router.use('/post',postRouter)

router.use('/test',testRouter)

module.exports=router