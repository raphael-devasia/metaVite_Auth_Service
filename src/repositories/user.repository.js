"use strict";
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUser = exports.createUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const messaging_service_1 = require("../services/messaging.service");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const createUser = (email, password, role, name, username, companyRefId, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId;
        // Check if the email already exists for the given role
        const existingUser = yield user_model_1.default.findOne({ email, role });
        // If an existing user with the same email and role is found, return a message
        if (existingUser) {
            userId = existingUser._id.toString();
            return {
                firstName: existingUser.name.firstName,
                message: "User with this email and role already exists",
                success: false,
                user: existingUser,
            };
        }
        // Create a new user instance if the email doesn't exist for the same role
        const user = new user_model_1.default({
            email,
            password,
            role,
            name,
            username,
            companyRefId,
        });
        // Save the user to the database
        const savedUser = yield user.save();
        console.log("User saved to database:", savedUser);
        const firstName = savedUser.name.firstName;
        userId = savedUser.id.toString();
        // Publish an event to RabbitMQ for sending a welcome email
        const message = JSON.stringify({
            email: user.email,
            subject: "Welcome to Our Service",
            text: `Hello ${user.name.firstName},\n\nThank you for registering with us! Your username is ${username}.\n\nBest regards,\nThe Team`,
        });
        try {
            yield (0, messaging_service_1.publishToQueue)("emailQueue", message);
            console.log("Message published to emailQueue");
        }
        catch (messageError) {
            console.error("Error publishing to queue:", messageError);
        }
        return {
            firstName,
            message: "User registered successfully",
            success: true,
            user: savedUser,
        };
    }
    catch (error) {
        console.error("Error creating user:", error);
        return {
            firstName: "",
            message: "Failed to create user",
            success: false,
            user: null,
        };
    }
});
exports.createUser = createUser;
const checkUser = (username, password, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userByUsername = yield user_model_1.default.findOne({ username });
        if (!userByUsername) {
            return {
                user: null,
                token: "",
                message: "Username does not exist",
                success: false,
            };
        }
        const user = yield user_model_1.default.findOne({ username, password, role });
        if (!user) {
            return {
                user: null,
                token: "",
                message: "Invalid username, password, or role",
                success: false,
            };
        }
        const token = generateToken(user);
        return {
            user,
            token,
            message: "User logged in successfully",
            success: true,
        };
    }
    catch (error) {
        console.error("Error checking user:", error);
        return {
            user: null,
            token: "",
            message: "Failed to log in",
            success: false,
        };
    }
});
exports.checkUser = checkUser;
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
    });
};
