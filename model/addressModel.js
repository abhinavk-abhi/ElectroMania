import mongoose from "mongoose";
const {Schema} = mongoose;

const addressModel = Schema({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    name : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    pincode : {
        type : String,
        required : true
    },
    locality : {
        type : String
    },
    address : {
        type : String,
        required : true
    },
    state : {
        type : String,
        required : true
    },
    city : {
        type : String,
        required : true
    },
    landMark : {
        type : String,
        required : true
    },
    altPhoneNumber : {
        type : String,
        required : true
    },
    addressType : {
        type : String,
        required : true,
        enum : ["Work","Home"]
    }
},{timestamps : true})

export default mongoose.model("Address", addressModel)