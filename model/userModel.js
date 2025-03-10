import mongoose from "mongoose";
const {Schema} = mongoose;

const userModel = new Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    phoneNumber : {
        type : String,
        required : true
    },
    isBlocked : {
        type : Boolean,
        required : true
    },
    gender : {
        type : String,
        required : true,
        enum : ["Male","Female"]
    },
    cart : {
        type : Schema.Types.ObjectId,
        ref : "cart",
        required: true
    },
    wishlist : {
        type : Schema.Types.ObjectId,
         ref : "wishlist",
        required : true
    },
    ordersIds : {
        type : Schema.Types.ObjectId,
        ref : "orders",
        required : true
    },
    address : {
        type : Schema.Types.ObjectId,
        ref : "address",
        required : true
    },
    couponOwned : {
        type : Schema.Types.ObjectId,
        ref : "coupon",
        required : true
    }
},{timestamps:true})

export default mongoose.model  ("user",userModel)