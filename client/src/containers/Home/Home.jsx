import { useEffect, useRef, useState } from 'react';
import '../../styles/Home.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { getallrides, getbookedrides, getpostedrides } from '../../store/userSlice';

const Home = () => {
    const redux_posts = useSelector((state) => state.user.allrides)
    const [editMode, setEditMode] = useState(false)
    const [editedUser, setEditedUser] = useState()
    const redux_user = useSelector((state) => state.user.user)
    const [posts, setPosts] = useState(redux_posts || []);
    const [selectedPost, setSelectedPost] = useState(null);
    const [allPosts, setAllPosts] = useState(redux_posts || []);
    const [bookedSeats, setBookedSeats] = useState(0);
    const [auth, setAuth] = useState(false)
    const dispatch = useDispatch()
    const hoverTime = useRef(null)
    const navigate = useNavigate()

    const _filter_relatablePosts = () => {
        console.log("Filtering relatable posts...")
        const curr_date = new Date();
        const filtered = posts.filter(post => {
            const postDate = new Date(post.date_time)
            return postDate >= curr_date
        })
        setPosts(filtered)
        setAllPosts(filtered)
    }

    const handle_from_loc = (e) => {
        const value = e.target.value.toLowerCase()
        if (value === "") {
            setPosts(allPosts)
            return
        }
        const filteredPosts = allPosts.filter(post => post.from.toLowerCase().includes(value))
        setPosts(filteredPosts)
    }

    const handle_to_loc = (e) => {
        const value = e.target.value.toLowerCase()
        if (value === "") {
            setPosts(allPosts)
            return
        }
        const filteredPosts = allPosts.filter(post => post.to.toLowerCase().includes(value))
        setPosts(filteredPosts)
    }

    //check auth............
    const _chkAuth = async () => {
        const res = await axios.get("http://localhost:200/api/poolcab/v1/user/checkauth",
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        )
        if (res.status === 200)
            setAuth(true)

    }

    //book ride function........
    const handle_book = async (x) => {
        // console.log(x, bookedSeats)
        try {
            const res = await axios.post("http://localhost:200/api/poolcab/v1/post/bookride",
                {
                    username: localStorage.getItem("username"),
                    bookedSeats,
                    _id: x._id
                },
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    }
                }
            )
            if (res.status === 200) {
                console.log("Ride booked successfully", res.data);
                setPosts(prevPosts => prevPosts.map(post => post._id === x._id ? { ...post, seats: post.seats - bookedSeats } : post));
                setSelectedPost({ ...selectedPost, seats: selectedPost.seats - bookedSeats });
                setBookedSeats(0)
                _fch_Posts()
                _fchbooked_Rides()
                toast.success("Ride booked successfully")
            }
        } catch (error) {
            if (error.status === 406) {
                toast.error("Invalid No. of Seats Selected")
            }
            if (error.status === 404) {
                toast.error("Ride not found")
            }
            console.error("Error booking ride:", error);
        }

    }

    const handle_hover = (x) => {
        hoverTime.current = setTimeout(() => {
            setSelectedPost(x)
        }, 1000)
    }

    const handle_leave = () => {
        clearTimeout(hoverTime.current);
    }

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
                console.log("Fetched all posts:", res.data)
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
            console.log("Fetched booked rides:", res.data);
            dispatch(getbookedrides(res.data.bookedRides));
        }
    }

    //fetch posted rides.............
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


    useEffect(() => {
        // _fch_Posts();
        //comment below func to view all posts including past date posts
        _filter_relatablePosts()
        _chkAuth()
        console.log("is Admin :",redux_user.isAdmin)
        console.log("is Blocked :",redux_user.isBlocked)
    }, []);

    const handleCloseModal = () => {
        setSelectedPost(null);
    };

    const handle_edit_button = () => {
        setEditMode(!editMode)
        setEditedUser(selectedPost)
    }

    const handle_save_button = async () => {
        // console.log(editedUser)
        try {
            setEditMode(!editMode)
            const res = await axios.post("http://localhost:200/api/poolcab/v1/post/adminupdate",
                {
                    _id: editedUser._id,
                    firstName: editedUser.firstName,
                    lastName: editedUser.lastName,
                    contact: editedUser.contact,
                    seats: editedUser.seats,
                    date_time: editedUser.date_time,
                    to: editedUser.to,
                    from: editedUser.from,
                    isAdmin: redux_user.isAdmin
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
            if (res.status == 200) {
                console.log("data from API", res.data)
                _fch_Posts()
                _fchbooked_Rides()
                _fchposted_Rides()
                // window.location.href="/home"
                toast.success("Ride Updated Successfully!")
            }
        } catch (error) {
            console.log("Error : ", error)
            toast.error(error.response.data.err)
        }
    }

    const handle_change = (field, value) => {
        setEditedUser((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <>
            {!auth ? <div className="light-err-login">
                <p>Login/Signup to See Rides...</p>
                <button onClick={() => { navigate('/login') }}>Login</button>
            </div> :
                <div>
                    {selectedPost && (
                        <div className="post-modal-overlay">
                            <div className="post-modal">
                                {redux_user.isAdmin && (editMode ? <button onClick={handle_save_button} className='admin-edit-btn'>Save</button> : <button onClick={handle_edit_button} className='admin-edit-btn'>Edit</button>)}
                                <button className="close-btn" onClick={handleCloseModal}>✖</button>
                                {editMode ? <>
                                    <label>Name : </label>
                                    <input
                                        value={editedUser.firstName}
                                        onChange={(e) => { handle_change("firstName", e.target.value) }}
                                    />
                                    <input
                                        value={editedUser.lastName}
                                        onChange={(e) => { handle_change("lastName", e.target.value) }}
                                    />
                                </>
                                    : <h2>{selectedPost.firstName} {selectedPost.lastName}</h2>
                                }

                                {editMode ? <p>
                                    <label>Contact : </label>
                                    <input
                                        value={editedUser.contact}
                                        onChange={(e) => { handle_change("contact", e.target.value) }}
                                    /></p>
                                    : <p>📞 {selectedPost.contact}</p>
                                }

                                <p>🚗 {selectedPost.vehicle}</p>

                                {editMode ? <>
                                    <label>To--&gt;From : </label>
                                    <input
                                        value={editedUser.from}
                                        onChange={(e) => { handle_change("from", e.target.value) }}
                                    />
                                    <input
                                        value={editedUser.to}
                                        onChange={(e) => { handle_change("to", e.target.value) }}
                                    />
                                </>
                                    : <p>📍 {selectedPost.from} --&gt; {selectedPost.to}</p>
                                }

                                {editMode ? <p>
                                    <label>Date of Departure : </label>
                                    <input
                                        type='datetime-local'
                                        value={editedUser.date_time}
                                        onChange={(e) => { handle_change("date_time", e.target.value) }}
                                    /></p>
                                    : <p>
                                        🕒 {
                                            (() => {
                                                const d = new Date(selectedPost.date_time);
                                                const day = d.toLocaleDateString('en-US', { weekday: 'short' });
                                                const date = d.getDate().toString().padStart(2, '0');
                                                const month = d.toLocaleDateString('en-US', { month: 'short' });
                                                const year = d.getFullYear();
                                                const hour = d.getHours().toString().padStart(2, '0');
                                                const minute = d.getMinutes().toString().padStart(2, '0');
                                                return `${day}, ${date} ${month} ${year} at ${hour}:${minute}`;
                                            })()
                                        }
                                    </p>
                                }

                                {editMode ? <>
                                    <label>Seats : </label>
                                    <input
                                        type='number'
                                        value={editedUser.seats}
                                        min={editedUser.seats}
                                        disabled
                                        onChange={(e) => { handle_change("seats", e.target.value) }}
                                    />
                                </>
                                    : <p>👥 Seats Available: {selectedPost.seats}</p>
                                }

                                {!editMode && <p><input type="number" onChange={(e) => { setBookedSeats(e.target.value) }} placeholder='Select Seats' min={1} max={selectedPost.seats} /></p>}
                                {!editMode && <button onClick={() => handle_book(selectedPost)} className='book-now'>Book Now</button>}
                            </div>
                        </div>
                    )}

                    <div className={`light-home-content ${selectedPost ? 'blurred' : ''}`}>
                        <div className="search-bars">
                            <input
                                type="text"
                                placeholder="From"
                                className="search-bar"
                                onChange={handle_from_loc}
                            // You can add value and onChange for filtering logic
                            />
                            <input
                                type="text"
                                placeholder="To"
                                className="search-bar exception"
                                onChange={handle_to_loc}
                            // You can add value and onChange for filtering logic
                            />
                        </div>

                        <div className="light-post-list">
                            {posts.map(post => (
                                <div
                                    key={post._id}
                                    className="light-post-item"
                                    onMouseEnter={() => handle_hover(post)}
                                    onMouseLeave={handle_leave}
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <h2>{post.firstName} {post.lastName}</h2>
                                    <p>📍 From: {post.from}</p>
                                    <p>📍 To: {post.to}</p>
                                    <p>
                                        🕒 {
                                            (() => {
                                                const d = new Date(post.date_time);
                                                const day = d.toLocaleDateString('en-US', { weekday: 'short' });
                                                const date = d.getDate().toString().padStart(2, '0');
                                                const month = d.toLocaleDateString('en-US', { month: 'short' });
                                                const year = d.getFullYear();
                                                const hour = d.getHours().toString().padStart(2, '0');
                                                const minute = d.getMinutes().toString().padStart(2, '0');
                                                return `${day}, ${date} ${month} ${year} at ${hour}:${minute}`;
                                            })()
                                        }
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>}
            {redux_user.isBlocked && <div className="user-blocked-wrapper">
                <div className="user-blocked-overlay">
                    <h1>Your Profile is Temporarily Blocked!</h1>
                </div>
            </div>}
        </>
    );
};

export default Home;
