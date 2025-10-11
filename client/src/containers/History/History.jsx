import { useEffect, useState } from 'react';
import '../../styles/History.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
const History = () => {
    // const [bookedRides, setBookedRides] = useState([]);
    // const [postedRides, setPostedRides] = useState([]);
    const [selectedBookedRide, setSelectedBookedRide] = useState(null)
    const [selectedPostedRide, setSelectedPostedRide] = useState(null)
    const redux_booked_rides = useSelector((state) => state.user.bookedrides)
    const redux_posted_rides = useSelector((state) => state.user.postedrides)
    const redux_user=useSelector((state)=>state.user.user)
    const [auth, setAuth] = useState(false)
    const navigate = useNavigate()

    //check auth....

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
        } catch (error) {
            localStorage.removeItem('firstrun')
        }
    }

    // const _fchbooked_Rides = async () => {
    //     const res = await axios.post("http://localhost:200/api/poolcab/v1/user/getbookedrides",
    //         { username: localStorage.getItem("username") },
    //         {
    //             headers: {
    //                 Authorization: `Bearer ${localStorage.getItem("token")}`
    //             }
    //         }
    //     )
    //     if (res.status === 200) {
    //         console.log("Fetched booked rides:", res.data);
    //         setBookedRides(res.data.bookedRides);
    //     }
    // }

    // const _fchposted_Rides = async () => {
    //     const res = await axios.post("http://localhost:200/api/poolcab/v1/user/getpostedrides",
    //         { username: localStorage.getItem("username") },
    //         {
    //             headers: {
    //                 "Authorization": `Bearer ${localStorage.getItem("token")}`
    //             }
    //         }
    //     )
    //     if (res.status === 200) {
    //         console.log("Fetched posted rides:", res.data);
    //         setPostedRides(res.data.postedRides);
    //     }
    // }
    useEffect(() => {
        // _fchbooked_Rides()
        // _fchposted_Rides()
        _chkAuth()
    }, [])
    return <>
        {!auth ? <div className="light-err-login">
            <p>Login/Signup to See History...</p>
            <button onClick={() => { navigate('/login') }}>Login</button>
        </div> : <div className="light-history-content">
            {selectedBookedRide && <div className="post-modal-overlay booked-ride-overlay">
                <div className="post-modal booked-ride-modal">
                    <button className="close-btn" onClick={() => setSelectedBookedRide(null)} >✖</button>
                    <h2>Posted By : {selectedBookedRide.rideDetails.firstName} {selectedBookedRide.rideDetails.lastName}</h2>
                    <p>Contact : {selectedBookedRide.rideDetails.contact}</p>
                    <p>From : {selectedBookedRide.rideDetails.from}</p>
                    <p>To : {selectedBookedRide.rideDetails.to}</p>
                    <p>Date : {
                            (() => {
                                const d = new Date(selectedBookedRide.rideDetails.date_time);
                                const day = d.toLocaleDateString('en-US', { weekday: 'short' });
                                const date = d.getDate().toString().padStart(2, '0');
                                const month = d.toLocaleDateString('en-US', { month: 'short' });
                                const year = d.getFullYear();
                                const hour = d.getHours().toString().padStart(2, '0');
                                const minute = d.getMinutes().toString().padStart(2, '0');
                                return `${day}, ${date} ${month} ${year} at ${hour}:${minute}`;
                            })()
                        }</p>
                    <p>Passengers : </p>
                    {selectedBookedRide.rideDetails.bookedBy.map((passenger, index) => (
                        <p key={index}>{passenger.firstName}({passenger.bookedSeats} Seats)</p>
                    ))}
                    <p>Seats Booked(You): {selectedBookedRide.seats}</p>
                </div>
            </div>}
            <h2>Booked Rides</h2>
            <div className="light-booked-list">
                {redux_booked_rides.map((rideObj, index) => (
                    <div className="booked-item" key={index} onClick={() => setSelectedBookedRide(rideObj)}>
                        <p>From: {rideObj.rideDetails.from}</p>
                        <p>To: {rideObj.rideDetails.to}</p>
                        <p>
                        Date : {
                            (() => {
                                const d = new Date(rideObj.rideDetails.date_time);
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
                        <p>Seats Booked: {rideObj.seats}</p>
                    </div>
                ))}
            </div>
            <h2>Posted Rides</h2>

            {selectedPostedRide && <div className="post-modal-overlay booked-ride-overlay">
                <div className="post-modal booked-ride-modal">
                    <button className="close-btn" onClick={() => setSelectedPostedRide(null)} >✖</button>
                    <h2>Posted By: Me</h2>
                    <p>Contact : {selectedPostedRide.contact}</p>
                    <p>From : {selectedPostedRide.from}</p>
                    <p>To : {selectedPostedRide.to}</p>
                    <p>
                        Date : {
                            (() => {
                                const d = new Date(selectedPostedRide.date_time);
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
                    <p>Passengers :</p>
                    {selectedPostedRide.bookedBy.map((passenger, index) => (
                        <p key={index}>{passenger.firstName}({passenger.bookedSeats} Seats)</p>))}

                    <p>Seats Posted : {selectedPostedRide.totalSeats}</p>
                </div>
            </div>}

            <div className="light-posted-list">
                {redux_posted_rides.map((rideObj, index) => (
                    <div className="booked-item" key={index} onClick={() => setSelectedPostedRide(rideObj)}>
                        <p>From: {rideObj.from}</p>
                        <p>To: {rideObj.to}</p>
                        <p>
                        Date : {
                            (() => {
                                const d = new Date(rideObj.date_time);
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
                        <p>Seats Posted: {rideObj.totalSeats}</p>
                    </div>
                ))}
            </div>
        </div>}
        {redux_user.isBlocked&&<div className="user-blocked-wrapper">
            <div className="user-blocked-overlay">
                <h1>Your Profile is Temporarily Blocked!</h1>
            </div>
        </div>}
    </>
}
export default History