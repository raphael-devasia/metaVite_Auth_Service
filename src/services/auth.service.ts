import bcrypt from "bcryptjs"
import { createUser, checkUser } from "../repositories/user.repository"
import { IUser } from "../models/user.model"
import { v4 as uuidv4 } from "uuid"
import { publishToQueue } from "./messaging.service"

// Register user
export const registerUser = async (
    user: IUser
): Promise<{
    firstName: string
    message: string
    success: boolean
    user: IUser | null
}> => {
    let companyRefId = "";
    const { role, email, password } = user
    if (role === "shipperAdmin" || role === "carrierAdmin") {
        companyRefId = generateCompanyRefId(role)
    }else{
       companyRefId= user.companyRefId
       console.log("companyRefId", companyRefId)
       
    }

    const { firstName, lastName } = user.name
    const username = generateUsername(role, firstName, lastName)

    const result: {
        firstName: string
        message: string
        success: boolean
        user: IUser | null
    } = await createUser(
        email,
        password,
        role,
        user.name,
        username,
        companyRefId,
        user.token
    )
if(result.success){
    // Publish an event to RabbitMQ for sending a welcome email
    console.log(result);
    
    const message = JSON.stringify({
        email: result.user?.email,
        subject: "Welcome to Our Service",
        text: `Hello ${result.firstName},\n\nThank you for registering with us! Your username is ${result.user?.username}.\n\nBest regards,\nThe Team`,
    })

    try {
        await publishToQueue("emailQueue", message)
        console.log("Message published to emailQueue")
    } catch (messageError) {
        console.error("Error publishing to queue:", messageError)
    }

        const userId = result.user?._id
        const data = { ...user, userId, companyRefId, username }
        console.log('data that is sending to the carrier:',data);
        
       if (
           result.user?.role == "carrierAdmin" ||
           result.user?.role == "driver"
       ) {
           try {
               await publishToQueue("carrierServiceQueue", JSON.stringify(data))
               console.log("Message published to carrierServiceQueue")
           } catch (messageError) {
               console.error("Error publishing to queue:", messageError)
           }
       } else if (
           result.user?.role == "shipperAdmin" ||
           result.user?.role == "shipperStaff"
       ) {
           try {
               await publishToQueue("shipperServiceQueue", JSON.stringify(data))
               console.log("Message published to shipperServiceQueue")
           } catch (messageError) {
               console.error("Error publishing to queue:", messageError)
           }
       }

}
    

    return result
}
export const loginUser = async (
    username: string,
    password: string
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
    return `${prefix}${uniqueId}`
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
