//

import { IUser } from "../models/user.model"
import User from "../models/user.model"
import { publishToQueue } from "../services/messaging.service"
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

export const createUser = async (
    email: string,
    password: string,
    role: string,
    name: { firstName: string; lastName: string },
    username: string,
    companyRefId: string,
    token: string
): Promise<{
    firstName: string
    message: string
    success: boolean
    user: IUser |null
}> => {
    try {
        let userId
        // Check if the email already exists for the given role
        const existingUser = await User.findOne({ email, role })

        // If an existing user with the same email and role is found, return a message
        if (existingUser) {
            userId = existingUser._id.toString()
            return {
                firstName: existingUser.name.firstName,
                message: "User with this email and role already exists",
                success: false,
                user: existingUser,
            }
        }

        // Create a new user instance if the email doesn't exist for the same role
        const user = new User({
            email,
            password,
            role,
            name,
            username,
            companyRefId,
        })

        // Save the user to the database
        const savedUser = await user.save()
        console.log("User saved to database:", savedUser)
        const firstName = savedUser.name.firstName
        userId = savedUser.id.toString()

        // Publish an event to RabbitMQ for sending a welcome email
        const message = JSON.stringify({
            email: user.email,
            subject: "Welcome to Our Service",
            text: `Hello ${user.name.firstName},\n\nThank you for registering with us! Your username is ${username}.\n\nBest regards,\nThe Team`,
        })

        try {
            await publishToQueue("emailQueue", message)
            console.log("Message published to emailQueue")
        } catch (messageError) {
            console.error("Error publishing to queue:", messageError)
        }

        return {
            firstName,
            message: "User registered successfully",
            success: true,
            user:savedUser,
        }
    } catch (error) {
        console.error("Error creating user:", error)
        return {
            firstName: "",
            message: "Failed to create user",
            success: false,
            user:null,
        }
    }
}

export const checkUser = async (
    username: string,
    password: string,
    role: string
): Promise<{
    user: IUser | null
    token: string
    message: string
    success: boolean
}> => {
    try {
        const userByUsername = await User.findOne({ username })
        if (!userByUsername) {
            return {
                user: null,
                token: "",
                message: "Username does not exist",
                success: false,
            }
        }
        const user = await User.findOne({ username, password, role })
        if (!user) {
            return {
                user: null,
                token: "",
                message: "Invalid username, password, or role",
                success: false,
            }
        }
        const token = generateToken(user)
        return {
            user,
            token,
            message: "User logged in successfully",
            success: true,
        }
    } catch (error) {
        console.error("Error checking user:", error)
        return {
            user: null,
            token: "",
            message: "Failed to log in",
            success: false,
        }
    }
}
const generateToken = (user: IUser): string => {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
    })
}
