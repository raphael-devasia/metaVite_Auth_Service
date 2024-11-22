import bcrypt from "bcryptjs"
import { createUser, checkUser } from "../repositories/user.repository"
import { IUser } from "../models/user.model"
import { v4 as uuidv4 } from "uuid"

// Register user
export const registerUser = async (
    email: string,
    password: string,
    role: string,
    name: {
        firstName: string
        lastName: string
    },

    companyRefId: string,
    token: string
): Promise<{
    firstName: string
    message: string
    success: boolean
    user: IUser|null
}> => {
    const username = generateUsername(role, name.firstName, name.lastName)

    const result: {
        firstName: string
        message: string
        success: boolean
        user: IUser |null
    } = await createUser(
        email,
        password,
        role,
        name,
        username,
        companyRefId,
        token
    )

    return result
}
export const loginUser = async (
    username: string,
    password: string,
): Promise<{
    user: IUser | null
    token: string
    message: string
    success: boolean
}> => {
    const role = findRoleFromUsername(username)
    const result: {
        user: IUser | null
        token: string
        message: string
        success: boolean
    } = await checkUser(username, password, role)

    

    return result
}
function generateUsername(role: string, firstName: string, lastName: string) {
    const rolePrefixes: { [key: string]: string } = {
        shipperAdmin: "SA",
        driver: "DR",
        shipperStaff: "SS",
        carrierAdmin: "CA",
        appAdmin: "AA",
    }

    const prefix = rolePrefixes[role]

    const nameInitials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() // Get initials

    // Generate a unique identifier (5 characters: last 3 digits of timestamp + 2 random letters)
    const timestampPart = Date.now().toString().slice(-3) // Last 3 digits of timestamp
    const randomPart = Math.random().toString(36).toUpperCase().slice(-2) // 2 random letters

    // Combine to make a 10-character username
    return `${prefix}${nameInitials}${timestampPart}${randomPart}`
}
// Helper function to generate a unique companyRefId
const generateCompanyRefId = (role: string): string => {
    const prefix = role === "shipperAdmin" ? "SH" : "CA" // Prefix for shipper or carrier
    const uniqueId = uuidv4().split("-")[0].toUpperCase()
    return `${prefix}-${uniqueId}`
}
const findRoleFromUsername = (username: string): string => {
    const rolePrefixes: { [key: string]: string } = {
        SA: "shipperAdmin",
        DR: "driver",
        SS: "shipperStaff",
        CA: "carrierAdmin",
        AA: "appAdmin",
    }
    const prefix = username.slice(0, 2)
    return rolePrefixes[prefix] || "unknown"
}
