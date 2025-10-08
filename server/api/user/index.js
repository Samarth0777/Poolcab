const express = require("express")
const User = require("../../models/user")
const Post = require("../../models/post")
const authMiddleware = require("../../middleware/authmiddleware")
const adminMiddleware = require("../../middleware/adminMiddleware")
const LocalStorage = require('node-localstorage').LocalStorage
const localStorage = new LocalStorage('./scratch')
const router = express.Router()
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const arctic = require('arctic')
const google = new arctic.Google(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI)

router.post("/register", async (req, res) => {
    let { firstName, lastName, email, password, username } = req.body
    if (!firstName || !lastName || !email || !password || !username) {
        return res.status(400).json({ error: "Please fill all fields" })
    }
    if (await User.findOne({ username }))
        return res.status(400).json({ error: "Username already exists" })
    if (await User.findOne({ email }))
        return res.status(400).json({ error: "Email already exists" })
    try {
        let hashed_pass = await bcrypt.hash(password, 10)
        const created_user = await User.create({
            firstName,
            lastName,
            email,
            password: hashed_pass,
            username
        })
        return res.status(201).json({ success: true, message: "User registered successfully", user: created_user })
    } catch (error) {
        console.error("Error in registration:", error)
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/getotp", async (req, res) => {
    const { username, otp } = req.body;
    // console.log(req.body)
    if (!username)
        return res.status(404).json({ error: "Please provide username" })
    const user = await User.findOne({ username })

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'samarthsaxena0777@gmail.com',
            pass: 'uehr dgse bizu fube'
        }
    })
    const emailBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">Hello ${user.firstName} ${user.lastName},</h2>
            <p>We received a request to log in to your PoolCab account. Use the following One-Time Password (OTP) to complete your login:</p>
            <h3 style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; color: #333;">
                ${otp}
            </h3>
            <p>If you did not request this, please ignore this email. Your account is safe.</p>
            <br>
            <p>Thank you,</p>
            <p>The <strong>PoolCab</strong> Team</p>
        </div>
    `;
    try {
        await transporter.sendMail({
            from: '"POOLCAB samarthsaxena0777@gmail.com',
            to: user.email,
            subject: "Login OTP",
            html: emailBody
        })
        return res.status(200).json({ msg: "Email Sent" })

    } catch (err) {
        console.error("Error Sending Mail:", err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/sendconfmail", async (req, res) => {
    const { username, post, bookedSeats } = req.body;
    // console.log(req.body)
    if (!username)
        return res.status(404).json({ error: "Please provide username" })
    const user = await User.findOne({ username })

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'samarthsaxena0777@gmail.com',
            pass: 'uehr dgse bizu fube'
        }
    })
    const emailBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">Hello ${user.firstName} ${user.lastName},</h2>
            <p>Your ride has been successfully booked. Here are the details of your ride:</p>
            <ul>
                <li><strong>From:</strong> ${post.from}</li>
                <li><strong>To:</strong> ${post.to}</li>
                <li><strong>Date & Time:</strong> ${new Date(post.date_time).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}</li>
                <li><strong>Posted By:</strong> ${post.firstName} ${post.lastName}</li>
                <li><strong>Vehicle:</strong> ${post.vehicle}</li>
                <li><strong>Seats Booked:</strong> ${bookedSeats}</li>
                <li><strong>Seats Left:</strong> ${post.seats}</li>
                <li><strong>Contact:</strong> ${post.contact}</li>
            </ul>
            <p>Thank you for using PoolCab. We hope you have a great experience!</p>
            <br>
            <p>Best regards,</p>
            <p>The <strong>PoolCab</strong> Team</p>
        </div>
    `;
    try {
        await transporter.sendMail({
            from: '"POOLCAB samarthsaxena0777@gmail.com',
            to: user.email,
            subject: "Booking Details",
            html: emailBody
        })
        return res.status(200).json({ msg: "Email Sent" })

    } catch (err) {
        console.error("Error Sending Mail:", err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.get("/googlelogin", async (req, res) => {
    res.clearCookie("google_oauth_state")
    res.clearCookie("google_code_verifier")
    const state = arctic.generateState()
    const codeVerifier = arctic.generateCodeVerifier()
    const url = google.createAuthorizationURL(state, codeVerifier, [
        "openid",
        "profile",
        "email"
    ])
    url.searchParams.append("prompt", "consent select_account")
    url.searchParams.append("account", "offline")


    const cookieConfig = {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 1000,
        sameSite: "lax",
    }
    res.cookie("google_oauth_state", state, cookieConfig)
    res.cookie("google_code_verifier", codeVerifier, cookieConfig)
    // console.log("url", url.toString())
    res.redirect(url.toString())
})

router.get("/googlecallback", async (req, res) => {
    try {
        const { code, state } = req.query;

        // Retrieve state and codeVerifier from cookies
        const storedState = req.cookies.google_oauth_state;
        const codeVerifier = req.cookies.google_code_verifier;

        // Validate state
        if (state !== storedState) {
            return res.status(400).json({ error: "Invalid state parameter" });
        }

        // Exchange the authorization code for tokens
        const tokens = await google.validateAuthorizationCode(code, codeVerifier);

        // Use the access token to fetch user info
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${tokens.accessToken()}`,
            },
        });

        const userInfo = await userInfoResponse.json();

        const user = await User.findOne({ email: userInfo.email })
        // console.log(user)

        // Generate a token for the user
        const token = await user.generateToken();
        res.cookie('token', token, {
            httpOnly: false,
            maxAge:  60 * 1000,
        })
        res.cookie('username', user.username,{
            httpOnly: false,
            maxAge:  60 * 1000,
        })
        res.redirect("http://localhost:5173/post")
        // return res.status(200).json({ success: true, message: "User logged in successfully", user, token: await user.generateToken() })
        // res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error handling Google OAuth callback:", error);
        // res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ error: "Please fill all fields" })
    }
    let hashed_pass;
    try {
        const user = await User.findOne({ username })
        if (!user)
            return res.status(404).json({ error: "User not found" })
        const matched = await bcrypt.compare(password, user.password)
        if (!matched)
            return res.status(401).json({ error: "Invalid credentials" })
        return res.status(200).json({ success: true, message: "User logged in successfully", user, token: await user.generateToken() })
    } catch (err) {
        console.error("Error in login:", err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/fchuser", async (req, res) => {
    const { username } = req.body
    if (!username) {
        return res.status(400).json({ error: "Username Empty!" })
    }
    console.log(username)
    try {
        const user = await User.findOne({ username: username })
        if (!user)
            return res.status(404).json({ error: "User not found" })
        return res.status(200).json({ user: user })
    } catch (err) {
        console.error("Error in login:", err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.get("/checkauth", authMiddleware, async (req, res) => {
    return res.status(200).json({ success: true, message: "User is authenticated" })

})

router.put("/updateprofile", authMiddleware, async (req, res) => {
    const { username, firstName, lastName, email, contact, currentAdd, vehicle } = req.body
    const avlVehicle = vehicle
    try {
        // console.log("Update profile request body:", req.body);
        const user = await User.findOne({ username: username })
        console.log(user)
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    firstName, lastName, email, contact, currentAdd, avlVehicle
                }
            },
            { new: true }
        )
        return res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser })
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/getbookedrides", authMiddleware, async (req, res) => {
    const { username } = req.body
    try {
        const user = await User.findOne({ username })
        if (!user)
            return res.status(404).json({ error: "User not found" })
        const bookedRides = user.bookedRides
        const detailedRides = []
        for (const ride of bookedRides) {
            const rideDetails = await Post.findById(ride._id)
            const seats = ride.bookedSeats
            detailedRides.push({ rideDetails, seats })
        }
        return res.status(200).json({ success: true, bookedRides: detailedRides })
    } catch (err) {
        console.error("Error in fetching booked rides:", err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/getpostedrides", authMiddleware, async (req, res) => {
    const { username } = req.body
    try {
        const user = await User.findOne({ username })
        if (!user)
            return res.status(404).json({ error: "User not found" })
        const postedRides = user.postedRides
        const detailedRides = []
        for (const rideId of postedRides) {
            const rideDetails = await Post.findById(rideId)
            detailedRides.push(rideDetails)
        }
        return res.status(200).json({ success: true, postedRides: detailedRides })
    } catch (err) {
        console.error("Error in fetching posted rides:", err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/getalluser", adminMiddleware, authMiddleware, async (req, res) => {
    // console.log("all user called")
    // res.status(200)
    try {
        const users = await User.find()
        return res.status(200).json({ users })
    } catch (error) {
        console.log("Internal Server Error", error)
        return res.status(500).json({ err: "Internal Server Error" })
    }
})

router.post("/adminblockuser", adminMiddleware, authMiddleware, async (req, res) => {
    const { username, _id } = req.body
    const isBlocked = true
    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                $set: { isBlocked }
            },
            { new: true }
        )
        return res.status(200).json({ msg: "user blocked successfully", updatedUser })
    } catch (error) {
        return res.status(500).json({ err: "Interna, Server Error!" })
    }
})

router.post("/adminunblockuser", adminMiddleware, authMiddleware, async (req, res) => {
    const { username, _id } = req.body
    const isBlocked = false
    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                $set: { isBlocked }
            },
            { new: true }
        )
        return res.status(200).json({ msg: "user unblocked successfully", updatedUser })
    } catch (error) {
        return res.status(500).json({ err: "Interna, Server Error!" })
    }
})

module.exports = router 