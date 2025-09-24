import { useEffect, useState } from "react";
import "../../styles/Profile.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setuser } from "../../store/userSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate=useNavigate()
    const redux_user = useSelector((state) => state.user.user);
    const dispatch=useDispatch();
    const [editMode, setEditMode] = useState(false);
    const [newVehicle, setNewVehicle] = useState("");
    const [user, setUser] = useState({
        firstName: redux_user.firstName || "Guest",
        lastName: redux_user.lastName || "",
        email: redux_user.email || "",
        contact: redux_user.contact || "",
        currentAdd: redux_user.currentAdd || "",
        username: redux_user.username || "guest",
        vehicle: redux_user.avlVehicle || []
    });

    //logout function....
    const handle_logout=()=>{
        localStorage.removeItem("token")
        localStorage.removeItem("username")
        localStorage.removeItem("i18nextLng")
        dispatch(setuser({}))
        toast.success("Logged out successfully")
        navigate('/login')
    }

    //update profile....
    const updateProfile = async () => {
        try {
            const res = await axios.put("http://localhost:200/api/poolcab/v1/user/updateprofile", user, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            })
    
            if (res.status === 200) {
                setEditMode((prev) => !prev)
                console.log(res.data)
                dispatch(setuser({...redux_user,['contact']:user.contact,['avlVehicle']:user.vehicle,['currentAdd']:user.currentAdd}) )
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating profile");
        }
    }

    const [showAllVehicles, setShowAllVehicles] = useState(false);

    const renderVehicles = () => {
        if (!user.vehicle || user.vehicle.length === 0) return "None";
        const maxDisplay = 3;
        if (showAllVehicles || user.vehicle.length <= maxDisplay) {
            return user.vehicle.join(", ");
        }
        return (
            <>
                {user.vehicle.slice(0, maxDisplay).join(", ")}
                {" "}
                <button
                    className="see-more-btn"
                    style={{ marginLeft: "8px", fontSize: "0.9em" }}
                    onClick={() => setShowAllVehicles(true)}
                >
                    See More
                </button>
            </>
        );
    };


    const handleChange = (field, value) => {
        setUser((prev) => ({ ...prev, [field]: value }));
    };

    // useEffect(()=>{
    //     console.log(redux_user)
    // })
    const handleAddVehicle = () => {
        if (newVehicle.trim()) {
            handleChange("vehicle", [...user.vehicle, newVehicle.trim()]);
            setNewVehicle("");
        }
    };

    const handleDeleteVehicle = (index) => {
        const updatedVehicles = user.vehicle.filter((_, i) => i !== index);
        handleChange("vehicle", updatedVehicles);
    };

    return (<>
        <div className="profile-blur-container">
            <button className="logout-btn" onClick={handle_logout}>Logout</button>
            <h1 className="profile-title">Profile - <b><i>{user.firstName}</i></b></h1>
            {editMode ? <button className="save-button" onClick={updateProfile}>Save</button > : <button className="edit-button" onClick={() => setEditMode((prev) => !prev)}>Edit Profile</button>}
            {/* <button
                className="edit-button"
                onClick={() => setEditMode((prev) => !prev)}
            >
                {editMode ? "Save" : "Edit Profile"}
            </button>
            <button>Save</button> */}

            <div className="profile-grid">
                {/* Each row */}
                <div className="label" >Full Name:</div>
                <div className="value">
                    {editMode ? (
                        <>
                            <input
                                type="text"
                                value={user.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                placeholder="First Name"
                                disabled
                            />
                            <input
                                type="text"
                                value={user.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                placeholder="Last Name"
                                disabled
                            />
                        </>
                    ) : (
                        `${user.firstName} ${user.lastName}`
                    )}
                </div>

                <div className="label">Username:</div>
                <div className="value">
                    {editMode ? (
                        <input
                            type="text"
                            value={user.username}
                            disabled
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                    ) : (
                        user.username
                    )}
                </div>

                <div className="label">Email:</div>
                <div className="value">
                    {editMode ? (
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                    ) : (
                        user.email
                    )}
                </div>

                <div className="label">Contact:</div>
                <div className="value">
                    {editMode ? (
                        <input
                            type="text"
                            value={user.contact}
                            onChange={(e) => handleChange("contact", e.target.value)}
                        />
                    ) : (
                        user.contact || "N/A"
                    )}
                </div>

                <div className="label">Address:</div>
                <div className="value">
                    {editMode ? (
                        <textarea
                            rows={2}
                            value={user.currentAdd}
                            onChange={(e) => handleChange("currentAdd", e.target.value)}
                        />
                    ) : (
                        user.currentAdd || "N/A"
                    )}
                </div>

                <div className="label">Joined:</div>
                <div className="value">{redux_user.created}</div>

                <div className="label">Vehicle:</div>
                <div className="value">
                    {editMode ? (
                        <>
                            <div>
                                {user.vehicle.length > 0 ? (
                                    user.vehicle.map((v, idx) => (
                                        <span key={idx} style={{ marginRight: "8px" }}>
                                            {v}
                                            <button
                                                style={{
                                                    marginLeft: "4px",
                                                    color: "red",
                                                    border: "none",
                                                    background: "none",
                                                    cursor: "pointer",
                                                    fontSize: "1em"
                                                }}
                                                onClick={() => handleDeleteVehicle(idx)}
                                                title="Delete"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                ) : "None"}
                            </div>
                            <div className="add-vehicle-row">
                                <input
                                    type="text"
                                    value={newVehicle}
                                    onChange={(e) => setNewVehicle(e.target.value)}
                                    placeholder="Add new vehicle"
                                />
                                <button className="add-vehicle-btn" onClick={handleAddVehicle}>
                                    + Add Vehicle
                                </button>
                            </div>
                        </>
                    ) : (
                        renderVehicles()
                    )}
                </div>
            </div>
        </div>
        {redux_user.isBlocked&&<div className="user-blocked-wrapper">
            <div className="user-blocked-overlay">
                <h1>Your Profile is Temporarily Blocked!</h1>
            </div>
        </div>}
        </>
        
    );
};

export default Profile;
