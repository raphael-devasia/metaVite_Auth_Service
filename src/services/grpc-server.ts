import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js"
import path from "path"
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
import { loginUser, registerUser } from "./auth.service"
import { IUser } from "../models/user.model"
import { log } from "@grpc/grpc-js/build/src/logging"

// Define paths
const PROTO_PATH = path.join(__dirname, "../../../protos/auth.proto")
console.log("Resolved proto file path:", PROTO_PATH)

// Load the .proto file with type options
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
})

// Create a typed object from the package definition
const authProto = grpc.loadPackageDefinition(packageDefinition).auth as any

// Create the gRPC server
const server = new grpc.Server()

// Implement service methods
server.addService(authProto.AuthService.service, {
    Register: async (
        call: ServerUnaryCall<
            {
                user: IUser
            },
            {
                firstName: string
                message: string
                success: boolean
                user: IUser | null
            }
        >,
        callback: sendUnaryData<{
            firstName: string
            message: string
            success: boolean

            user: IUser | null
        }>
    ) => {
        const  {user} = call.request
        
        

        try {
            const data = await registerUser(user)
            callback(null, data)
        } catch (error) {
            callback(error as Error, null)
        }
    },
    Login: async (
        call: ServerUnaryCall<
            { username: string; password: string },
            { user: IUser; token: string; role: string }
        >,
        callback: sendUnaryData<{}>
    ) => {
        try {
            const { username, password } = call.request
            const result = await loginUser(username, password)
            callback(null, result)
        } catch (error) {
            callback(error as Error, null)
        }
    },
})

// Start the gRPC server
server.bindAsync(
    "0.0.0.0:3001",
    grpc.ServerCredentials.createInsecure(),
    () => {
        console.log("Auth Service gRPC server running at http://0.0.0.0:3001")
        server.start()
    }
)
