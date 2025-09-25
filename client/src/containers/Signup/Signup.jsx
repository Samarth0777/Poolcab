import { useNavigate } from 'react-router-dom';
import '../../styles/Signup.css';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Signup = () => {
   const [user, setUser] = useState({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: ""
   });

   const navigate = useNavigate();

   const fill = (e) => {
      const { name, value } = e.target;
      setUser({
         ...user,
         [name]: value
      });
   };

   const handle_signup = async (e) => {
      e.preventDefault();
      try {
         const res = await axios.post(
            "http://localhost:200/api/poolcab/v1/user/register",
            user,
            {
               headers: {
                  'Content-Type': 'application/json'
               }
            }
         );
         // console.log(res)

         if (res.status === 201) {
            console.log("User registered successfully", res.data);
            toast.success("User Registered Successfully")
            navigate("/login"); // Optional redirect
         }
      } catch (err) {
         console.log(err);
         toast.error(err.response.data.error)
      }
   };

   return <>
         <h1 className="signup-title">Register Now!</h1>
      <div className="signup-wrapper">
         <div className="signup-container">
            <form className="signup-form" onSubmit={handle_signup}>
               <div className="signup-field">
                  <label className="signup-label">First Name</label>
                  <input className="signup-input" type="text" name="firstName" value={user.firstName} onChange={fill} required />
               </div>
               <div className="signup-field">
                  <label className="signup-label">Last Name</label>
                  <input className="signup-input" type="text" name="lastName" value={user.lastName} onChange={fill} required />
               </div>
               <div className="signup-field">
                  <label className="signup-label">Username</label>
                  <input className="signup-input" type="text" name="username" value={user.username} onChange={fill} required />
               </div>
               <div className="signup-field">
                  <label className="signup-label">Email</label>
                  <input className="signup-input" type="email" name="email" value={user.email} onChange={fill} required />
               </div>
               <div className="signup-field">
                  <label className="signup-label">Password</label>
                  <input className="signup-input" type="password" name="password" value={user.password} onChange={fill} required />
               </div>
               <div className="signup-btn-container">
                  <button type="submit" className="signup-btn">Sign Up</button>
               </div>
               <div className="signup-footer">
                  Already a member? <a href="/login">Login now</a>
               </div>
            </form>
         </div>
      </div>
   </>;
};

export default Signup;
