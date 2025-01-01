import mongoose, { Schema, Document } from "mongoose"



interface IAddress {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
}

interface IEmergencyContact {
    name: string
    phoneNumber: string
}

interface ICompanyDetails {
    companyName: string
    companyEmail: string
    companyPhone: string
    taxId: string
    address: IAddress
}

export interface IUser  {
    _id:string
    name: {
        firstName: string
        lastName: string
    }
    role:string
    email: string
    phoneNumber:string
    password:string
    companyRefId: string
    username:string
    address: IAddress
    personalDetails: {
        emergencyContact: IEmergencyContact
    }
    companyDetails: ICompanyDetails
    token:string
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
