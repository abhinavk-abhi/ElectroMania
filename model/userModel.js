import mongoose from "mongoose";
const {Schema} = mongoose;

const userModel = new Schema({
    userId : {
        type : String,
        required : false,
    },
    name : {
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
        unique : true,
        sparse : true
    },
    
    profilePic : {
        type : String,
        required : false
    },
    
    phone : {
        type : String,
        required : false,
        unique : true,
        sparse : true,
        default : null,
    },
    isBlocked : {
        type : Boolean,
        default : false,
        required : true
    },
    gender : {
        type : String,
        required : false,
       
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
        required : false
    },
    couponOwned : {
        type : Schema.Types.ObjectId,
        ref : "coupon"
    }
},{timestamps:true})

export default mongoose.model("User",userModel)