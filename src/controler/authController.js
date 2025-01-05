import User from "../model/authModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { configDotenv } from 'dotenv'
configDotenv()
// user signup api 
const signupUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    //    console.log(req.body)
    try {
        let userByUsername = await User.findOne({ username });
        if (userByUsername) {
            return res.status(400).send({ message: 'Username already exists' });
        }

        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).send({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = jwt.sign({ email, role, username }, 'Haseeb');

        const newUser = new User({ username, email, password: hashedPassword, role });
        const data = await newUser.save();
        const user_data = {
            email: data.email,
            id: data._id,
            username: data.username,
            role: data.role
        };

        // Set the JWT token in a cookie
        res.cookie('token', token, {
            httpOnly: true, // To prevent client-side access to the cookie
            secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        return res.status(200).send({ status: 200, message: "Registration successful", user_data, token });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// signin api 
let signinUser = async (req, res) => {
    const { email, password } = req.body;
    //   console.log(req.body);

    try {
        // Find user by email and exclude password from returned document
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Check if user role is admin
        if (user.role !== 'user') {
            return res.status(403).send({ status: 403, message: "Invalid email or password" });
        }

        // Prepare minimal user data to include in the JWT payload
        const user_data = {
            email: user.email,
            id: user._id,
            username: user.username,
            // profileurl: user.profileurl,
            role: user.role
        };

        // Generate JWT token
        const token = jwt.sign(user_data, 'Haseeb');

        // Return success response with user data (without password) and token
        return res.status(200).send({ status: 200, message: "Login successful", user_data, token });

    } catch (error) {
        // Handle any errors
        console.log(error)
        res.status(500).send({ status: 500, message: "Internal server error", error: error.message });
    }
}
// admin login api 
let adminLogin = async (req, res) => {
    const { email, password } = req.body;


    try {
        // Find user by email and exclude password from returned document
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Check if user role is admin
        if (user.role !== 'admin') {
            return res.status(403).send({ status: 403, message: "Invalid email or password" });
        }

        // Prepare minimal user data to include in the JWT payload
        const user_data = {
            email: user.email,
            id: user._id,
            role: user.role,
            // profileurl: user.profileurl,
            username: user.username
            // Include role in JWT payload
            // Add more fields as needed
        };

        // Generate JWT token
        const token = jwt.sign(user_data, 'Haseeb');
        // Set the JWT token in a cookie
        res.cookie('token', token, {
            httpOnly: true, // To prevent client-side access to the cookie
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000, // 1 hour
        });
        // Return success response with user data (without password) and token
        return res.status(200).send({ status: 200, message: "Login successful", user_data, token });

    } catch (error) {
        // Handle any errors
        res.status(500).send({ status: 500, message: "Internal server error", error: error.message });
    }
}


export { signupUser, signinUser, adminLogin };
