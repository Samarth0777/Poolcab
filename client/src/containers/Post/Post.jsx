import '../../styles/Post.css';
import { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getallrides, getbookedrides, getpostedrides, setuser } from '../../store/userSlice';
import i18n from '../../i18n';
import { useRef } from 'react';

const Post = () => {

    const [isSelectFocused, setIsSelectFocused] = useState(false);
    const [auth, setAuth] = useState(false);
    const navigate = useNavigate()
    const redux_user = useSelector((state) => state.user.user)
    const redux_lang = useSelector((state) => state.user.lang)
    const [_chkprofile, setCheckProfile] = useState(false)
    const dispatch = useDispatch()
    const feched = useRef(false)

    //i18n initialization..........
    const { t: translate } = useTranslation()

    //change language..........
    const changeLanguage = () => {
        i18n.changeLanguage(redux_lang)
    }

    //check auth..............
    const _chkAuth = async () => {
        try {
            const res = await axios.get("http://localhost:200/api/poolcab/v1/user/checkauth",
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
            if (res.status === 200)
                setAuth(true)
            
            //////////////////To check Profile Completion//////////////////
            if (redux_user.firstName.length > 0 && redux_user.lastName.length > 0 && redux_user.contact.length > 0 && redux_user.avlVehicle.length > 0) {
                setCheckProfile(true)
            }
            
        } catch (error) {
            if(error.status===401){
                localStorage.removeItem('firstrun')
            }
        }
    }

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

    const _fchUser = async (username) => {
        const res = await axios.post('http://localhost:200/api/poolcab/v1/user/fchuser', {
            username: username
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
        // console.log(res)
        dispatch(setuser(res.data.user))
        _fch_Posts()
        _fchbooked_Rides()
        _fchposted_Rides()
        if (res.data.user.firstName.length > 0 && res.data.user.lastName.length > 0 && res.data.user.contact.length > 0 && res.data.user.avlVehicle.length > 0) {
            setCheckProfile(true)
        }
    }

    useEffect(() => {
        // console.log("redux_user in post:", redux_user)
        if (localStorage.getItem('firstrun')) {
            // console.log(feched.current)
            _chkAuth()

            return;
        }
        localStorage.setItem('firstrun',"true")
        var cookies = document.cookie
        const x = Object.fromEntries(
            cookies.split('; ').map(pair => pair.split('='))
        )
        feched.current = true
        const token = x.token
        localStorage.setItem('token', token)
        const username = x.username
        _fchUser(username)
        localStorage.setItem('username', username)
        _chkAuth()
        console.log(typeof (feched.current))

    }, [])

    useEffect(() => {
        changeLanguage()
    }, [redux_lang])

    const [post, setPost] = useState({
        firstName: redux_user.firstName || "",
        lastName: redux_user.lastName || "",
        contact: redux_user.contact || "",
        vehicle: "",
        to: "",
        from: "",
        seats: 0,
        totalSeats: 0,
        date_time: "",
        username: redux_user.username || localStorage.getItem("username")
    });

    useEffect(() => {
        if (redux_user && redux_user.firstName) {
            setPost(prev => ({ ...prev, firstName: redux_user.firstName }));
        }
    }, [redux_user]);

    const handle_change = (e) => {
        const { name, value } = e.target;
        if (name === "seats") {
            setPost(prev => ({ ...prev, [name]: value, ['totalSeats']: value }))
        }
        else {
            setPost({ ...post, [e.target.name]: e.target.value });
        }
    };

    //fetch all posts............
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
            console.log("Fetched posted rides:", res.data);
            dispatch(getpostedrides(res.data.postedRides));
        }
    }

    //confirmation sent over email

    const send_conf_mail = async (post) => {
        try {
            const res = await axios.post("http://localhost:200/api/poolcab/v1/post/sendconfmail", {
                username: localStorage.getItem("username"),
                post: post
            })
            if (res.status === 200)
                console.log("Confirmation Email Sent!")
        } catch (error) {
            console.error("Error Sending Mail:", error);
            toast.error("Error Sending Mail");
        }
    }

    //post ride function........
    const handle_submit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const res = await axios.post(
                "http://localhost:200/api/poolcab/v1/post/postride",
                post,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            if (res.statusText === "Created") {
                console.log("Post created successfully", res.data);
                setPost({ ...post, vehicle: "", from: "", to: "", seats: 0, date_time: "" });
                _fch_Posts()
                _fchposted_Rides()
                toast.success("Post created successfully");
                send_conf_mail(res.data.post)
            }
        } catch (error) {
            console.error("Error creating post:", error);
            toast.error("Error creating post");
        }
    };

    return <>
        {!auth ? <div className="light-err-login">
            <p>Login/Signup to Post Rides...</p>
            <button onClick={() => { navigate('/login') }}>Login</button>
        </div> : <div className="light-post-wrapper">
            {isSelectFocused && <div className="light-post-overlay" onClick={() => setIsSelectFocused(false)}></div>}
            <div className={`light-post-wrapper ${isSelectFocused ? 'light-blur-background' : ''}`}>
                <div className="light-post-container">
                    <h1 className="light-post-title">{translate('post_title')}</h1>
                    <form className="light-post-form" onSubmit={handle_submit}>
                        <div className="light-form-group">
                            <label htmlFor="firstName">{translate('firstName')}</label>
                            <input type="text" name="firstName" onChange={handle_change} placeholder="First Name" value={redux_user.firstName} disabled required />
                        </div>
                        <div className="light-form-group">
                            <label htmlFor="lastName">{translate('lastName')}</label>
                            <input type="text" name="lastName" onChange={handle_change} placeholder="Last Name" value={redux_user.lastName} disabled required />
                        </div>
                        <div className="light-form-group">
                            <label htmlFor="contact">{translate('contact')}</label>
                            <input type="text" name="contact" onChange={handle_change} placeholder="Contact Number" value={redux_user.contact} disabled required />
                        </div>
                        <div className="light-form-group">
                            <label htmlFor="vehicle">{translate('select-veh')}</label>
                            <select
                                name="vehicle"
                                onChange={handle_change}
                                onFocus={() => setIsSelectFocused(true)}
                                onBlur={() => setIsSelectFocused(false)}
                                value={post.value}
                                required
                            >
                                <option value="">-- Select Vehicle --</option>
                                {redux_user.avlVehicle && redux_user.avlVehicle.map((veh, index) => (
                                    <option key={index} value={veh}>{veh}</option>
                                ))}
                            </select>
                        </div>
                        <div className="light-form-group">
                            <label htmlFor="from">{translate('from')}</label>
                            <input type="text" name="from" onChange={handle_change} placeholder="Starting Point" value={post.from} required />
                        </div>
                        <div className="light-form-group">
                            <label htmlFor="to">{translate('to')}</label>
                            <input type="text" name="to" onChange={handle_change} placeholder="Destination" value={post.to} required />
                        </div>
                        <div className="light-form-group">
                            <label htmlFor="seats">{translate('seats')}</label>
                            <input type="number" name="seats" min="1" onChange={handle_change} placeholder="Number of Seats" value={post.seats} required />
                        </div>
                        <div className="light-form-group">
                            <label htmlFor="date_time">{translate('date-time')}</label>
                            <input type="datetime-local" name="date_time" onChange={handle_change} value={post.date_time} required />
                        </div>
                        <button type="submit" className="light-submit-btn">{translate('post-journey-btn')}</button>
                    </form>
                </div>
            </div>
        </div>}
        {auth && !_chkprofile && <div className="comp-profile-overlay">
            <div className="comp-profile">
                <h2>Please Complete your Profile to Post a Ride!</h2>
                <button onClick={() => navigate("/Profile")}>Profile</button>
            </div>
        </div>}
        {redux_user.isBlocked && <div className="user-blocked-wrapper">
            <div className="user-blocked-overlay">
                <h1>Your Profile is Temporarily Blocked!</h1>
            </div>
        </div>}
    </>;
};

export default Post;
