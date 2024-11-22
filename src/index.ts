import dotenv from "dotenv"
import dbConfig from "./config/db.config"
import "./services/grpc-server" // Import the gRPC server setup

dotenv.config()

const PORT = process.env.PORT || 3001


dbConfig()
    .then(() => {
        console.log(`Auth Service is running on port ${PORT}`)
    })
    .catch((error) => {
        console.error("Failed to connect to the database:", error)
    })
