import mongoose from "mongoose";
const {Schema} = mongoose;

const addressModel = Schema({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    userName : {
        type : String,
        required : true
    },
    phoneNumbeer : {
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
    houseNumber : {
        type : String
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
        type : String
    },
    altPhoneNumber : {
        type : String
    },
    addressType : {
        type : String,
        required : true,
        enum : ["Work","Home"]
    }
},{timestamps : true})

export default mongoose.model("Address", addressModel)