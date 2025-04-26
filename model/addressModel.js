import mongoose from "mongoose";
const {Schema} = mongoose;

const addressModel = Schema({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    details : [{
        name : {
            type : String,
            required : true
        },
        phone : {
            type : String,
            required : true
        },
        zipCode : {
            type : String,
            required : true
        },
        locality : {
            type : String
        },
        addressLine1 : {
            type : String,
            required : true
        },
        addressLine2 : {
            type : String,
            required : false
        },
        state : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true
        },
        landmark : {
            type : String,
            required : false
        },
        altNumber : {
            type : String,
            required : false
        },
        addressType : {
            type : String,
            required : true,
        },
        country : {
            type : String,
            default : "India",
        },

    }]
},{timestamps : true})

export default mongoose.model("Address", addressModel)