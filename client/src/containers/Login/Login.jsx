import '../../styles/Login.css'
import axios from 'axios';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getpostedrides, setuser, getbookedrides, getallrides } from '../../store/userSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const Login = () => {

   const [user, setUser] = useState({
      username: "",
      password: "",
      otp: ""
   })

   const [otp,setOTP]=useState(0)
   const dispatch = useDispatch()
   const redux_user = useSelector((state) => state.user.user)
   const navigate = useNavigate()

   //fetch all rides..............
   const _fch_Posts = async () => {
      try {
         const res = await axios.get("http://localhost:200/api/poolcab/v1/post/getrides", {
            headers: {
               "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
         });

         if (res.status === 200) {
            // setPosts(res.data.posts);
            // setAllPosts(res.data.posts)
            // setAuth(true);
            dispatch(getallrides(res.data.posts))
         }
      } catch (err) {
         console.error("Error fetching posts", err);
      }
   };

   //fetch booked rides............
   const _fchbooked_Rides = async () => {
      const res = await axios.post("http://localhost:200/api/poolcab/v1/user/getbookedrides",
         { username: localStorage.getItem("username") },
         {
            headers: {
               Authorization: `Bearer ${localStorage.getItem("token")}`
            }
         }
      )
      if (res.status === 200) {
         // console.log("Fetched booked rides:", res.data);
         dispatch(getbookedrides(res.data.bookedRides));
      }
   }
   //fetch posted rides............
   const _fchposted_Rides = async () => {
      const res = await axios.post("http://localhost:200/api/poolcab/v1/user/getpostedrides",
         { username: localStorage.getItem("username") },
         {
            headers: {
               "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
         }
      )
      if (res.status === 200) {
         // console.log("Fetched posted rides:", res.data);
         dispatch(getpostedrides(res.data.postedRides));
      }
   }

   // useEffect(() => {
   //    console.log("redux_user updated: ", redux_user)
   // }, [redux_user])

   const fill = (e) => {
      const { name, value } = e.target
      setUser({
         ...user,
         [name]: value
      })
   }
   const handle_login = async (e) => {
      if (otp != user.otp){
         // console.log(otp,user.otp)
         toast.error("Incorrect OTP!")
      }
      else
         try {

            const res = await axios.post('http://localhost:200/api/poolcab/v1/user/login',
               user,
               {
                  headers: {
                     "Access-Control-Allow-Origin": "*",
                     "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
                     'Content-Type': 'application/json'
                  }
               }
            )
            //set user in redux
            if (res.statusText === "OK") {
               console.log("User logged in successfully", res.data)
               dispatch(setuser(res.data.user))
               // console.log("redux_user", redux_user)
               localStorage.setItem("username", res.data.user.username)
               localStorage.setItem("token", res.data.token)
               _fch_Posts()
               _fchbooked_Rides()
               _fchposted_Rides()
               navigate('/post')
               //this will make redux store resets to initial state
               // window.location.href="/home"
               toast.success("Logged in successfully")
            }

         } catch (error) {
            console.log("Error logging in:", error)
            if (error.status === 400)
               toast.error("All fields are required")
            if (error.status === 404)
               toast.error("No user with this username exists")
            if (error.status === 401)
               toast.error("Invalid credentials")
            if (error.status === 500)
               toast.error("Internal server error")
         }
   }

   const send_otp = async () => {
      const x=Math.floor(1000 + Math.random() * 9000)
      setOTP(x)
      try {
         const res = await axios.post("http://localhost:200/api/poolcab/v1/user/getotp", {
            username: user.username,
            otp: x
         })
         if (res.status == 200)
            console.log(res)
      } catch (err) {
         console.log(err)
         // toast.error(err.response.data.error)
      }
   }

   return <>
      <div className="login-wrapper">
         <h1 className="login-title">Login</h1>
         <div className="form">
            <div className="login-username">
               <input className="forminput" type="text" onChange={fill} placeholder='Username' name="username" value={user.username} required />
            </div>
            <div className="login-password">
               <input className="forminput" type="password" onChange={fill} placeholder='Password' name="password" value={user.password} required />
            </div>
            <div>
               <input className='forminput' type="text" onChange={fill} name='otp' placeholder='OTP' required />
            </div>
            <div className="submit">
               <button onClick={send_otp}>Get OTP</button>
            </div>
            <div className="submit">
               <button onClick={handle_login}>Login</button>
            </div>
            <div className="signup-link">
               Create Account? <a href="/signup">Sign Up</a>
            </div>
         </div>
      </div>
   </>
}
export default Login