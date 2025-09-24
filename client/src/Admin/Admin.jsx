import axios from 'axios'
import '../styles/Admin.css'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
const Admin = () => {
    const [users, setUsers] = useState([])
    const [selecteduser, setSelectedUser] = useState(null)
    const [booked, setBooked] = useState(null)
    const [posted, setPosted] = useState(null)
    const [post_div, set_Post] = useState(false)
    const [book_div, set_Book] = useState(false)
    const redux_user = useSelector((state) => state.user.user)

    const getAllUsers = async () => {
        try {
            const res = await axios.post("http://localhost:200/api/poolcab/v1/user/getalluser", { isAdmin: redux_user.isAdmin },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
            if (res.status === 200) {
                setUsers(res.data.users)
                // console.log(res.data.users)
            }
        } catch (error) {
            console.log(error.response)
        }
    }

    const handle_list_click = (user) => {
        // console.log(user)
        setSelectedUser(user)
        _fchbooked_Rides(user)
        _fchposted_Rides(user)
    }

    const handle_close = () => {
        setSelectedUser(null)
        setBooked(null)
        setPosted(null)
    }

    const _fchbooked_Rides = async (user) => {
        const res = await axios.post("http://localhost:200/api/poolcab/v1/user/getbookedrides",
            { username: user.username },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        )
        if (res.status === 200) {
            //  console.log("Fetched booked rides:", res.data);
            //  dispatch(getbookedrides(res.data.bookedRides));
            setBooked(res.data.bookedRides)
            // console.log(res.data.bookedRides)
        }
    }
    //fetch posted rides............
    const _fchposted_Rides = async (user) => {
        const res = await axios.post("http://localhost:200/api/poolcab/v1/user/getpostedrides",
            { username: user.username },
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        )
        if (res.status === 200) {
            //  console.log("Fetched posted rides:", res.data);
            //  dispatch(getpostedrides(res.data.postedRides));
            setPosted(res.data.postedRides)
            // console.log(posted)
        }
    }

    const handle_post_book_close = () => {
        // setBooked(null)
        // setPosted(null)
        set_Book(false)
        set_Post(false)
    }

    const handle_blacklist = async (user) => {
        try {
            const res = await axios.post("http://localhost:200/api/poolcab/v1/user/adminblockuser", {
                    _id:user._id,
                    isAdmin:redux_user.isAdmin
                },
                {
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":`Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
            console.log(res)
            if(res.status===200){
                setSelectedUser(prev=>({...prev,isBlocked:true}))
                await getAllUsers()
                toast.success("User Blocked Successfully!")
            }
        } catch (error) {
            toast.error(error.response.data.err)
        }
    }

    const handle_unblock=async(user)=>{
        const res = await axios.post("http://localhost:200/api/poolcab/v1/user/adminunblockuser", {
                _id:user._id,
                isAdmin:redux_user.isAdmin
            },
            {
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${localStorage.getItem("token")}`
                }
            }
        )
        console.log(res)
        if(res.status===200){
            setSelectedUser(prev=>({...prev,isBlocked:false}))
            await getAllUsers()
            toast.success("User Unblocked Successfully!")
        }
    }

    useEffect(() => {
        getAllUsers()
    }, [])
    return <>
        <div className="light-admin-content">
            <h1>Admin</h1>
            <div className="light-user-list">
                <ul>
                    {users.map(user => (
                        <li onClick={() => handle_list_click(user)} key={user._id}>
                            <div className='left-side'>
                                {user.isAdmin?<p>{user.firstName} {user.lastName}(Admin)</p>:<p>{user.firstName} {user.lastName}</p>}
                                
                                <p><i>{user.username}</i></p>
                            </div>
                            <div className='right-side'>
                                <p>Joined :
                                    {user.created
                                        ? new Date(user.created).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : "N/A"}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
                {selecteduser && <div className="post-modal-overlay booked-ride-overlay">
                    <div className="post-modal booked-ride-modal">
                        <button className="close-btn" onClick={handle_close} >✖</button>
                        <h2>{selecteduser.firstName} {selecteduser.lastName}</h2>
                        <p>{selecteduser.username}</p>
                        <p>{selecteduser.contact}</p>
                        <p>{selecteduser.currentAdd}</p>
                        <p>{selecteduser.email}</p>
                        <p>{selecteduser.created
                            ? new Date(selecteduser.created).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : "N/A"}</p>
                        <p>{selecteduser.isAdmin}</p>
                        <p onClick={() => set_Post(true)}>Booked Rides ➡️</p>
                        <p onClick={() => set_Book(true)}>Posted Rides ➡️</p>
                        {selecteduser.isBlocked?<button onClick={()=>{handle_unblock(selecteduser)}}>Unblock</button>:<button onClick={()=>{handle_blacklist(selecteduser)}}>Blacklist</button>}
                    </div>
                </div>}
                {post_div && <div className="booked_posted-wrapper">
                    <div className="booked_posted-overlay">
                        <button className='close-btn' onClick={handle_post_book_close}>✖</button>
                        <ul>
                            {booked.map(rides => (
                                <li>
                                    <p>{rides.rideDetails.firstName}</p>
                                    <p>{rides.rideDetails.to} -&gt; {rides.rideDetails.from}</p>
                                    <p>Seats Booked : {rides.seats}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>}
                {book_div && <div className="booked_posted-wrapper">
                    <div className="booked_posted-overlay">
                        <button className='close-btn' onClick={handle_post_book_close}>✖</button>
                        <ul>
                            {posted.map(rides => (
                                <li>
                                    <p>{rides.firstName} {rides.lastName}</p>
                                    <p>{rides.to} -&gt; {rides.from}</p>
                                    <p>Seats Posted : {rides.totalSeats}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>}
            </div>
        </div>
        {redux_user.isBlocked&&<div className="user-blocked-wrapper">
            <div className="user-blocked-overlay">
                <h1>Your Profile is Temporarily Blocked!</h1>
            </div>
        </div>}
    </>
}

export default Admin;