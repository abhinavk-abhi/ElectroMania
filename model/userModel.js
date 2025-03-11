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
        required : false
    },
    googeId : {
        type : String,
        required : false
    },
    phoneNumber : {
        type : String,
        required : false
    },
    isBlocked : {
        type : Boolean,
        default : false,
        required : true
    },
    gender : {
        type : String,
        required : true,
        enum : ["Male","Female"]
    },
    cart : [{
        type : Schema.Types.ObjectId,
        ref : "cart"
    }],
    wishlist : {
        type : Schema.Types.ObjectId,
         ref : "wishlist"
    },
    ordersIds : {
        type : Schema.Types.ObjectId,
        ref : "orders"
    },
    address : {
        type : Schema.Types.ObjectId,
        ref : "address",
        required : true
    },
    couponOwned : {
        type : Schema.Types.ObjectId,
        ref : "coupon"
    }
},{timestamps:true})

export default mongoose.model  ("user",userModel)