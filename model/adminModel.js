import mongoose from "mongoose";
const {Schema} = mongoose;

const adminModel = new Schema({
    adminName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
         unique : true,
         trim : true,
         lowercase : true
    },
    password : {
        type : String,
        required : true
    }
},{timestamps : true})

export default mongoose.model("Admin",adminModel)