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
    googleId : {
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
    },
    wallet: {
        type: Number,
        default: 0, 
    },

    walletHistory: [{
        amount: Number,              // +ve for credit, -ve for debit
        type: {
            type: String,         
            enum: ['refund', 'top-up', 'purchase','referral-reward'], 
        },
        orderId: {
            type: String,
            required: false          // Only for refund or purchase type
        },
        transactionId: {
            type: String,
            required: false          // Razorpay or refund reference
        },
        date: {
            type: Date,
            default: Date.now
        },
    
    }],
},{timestamps:true})

export default mongoose.model("User",userModel)