import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    email: string
    password: string
    username: string
    name: { firstName: string; lastName: string }
    role: string
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true,  },
    password: { type: String, required: true },
    role: { type: String, required: true },
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
    },
    username: { type: String, required: true,  },
    companyRefId: { type: String},
})
UserSchema.index({ email: 1, role: 1 }, { unique: true })
export default mongoose.model<IUser>("User", UserSchema)
