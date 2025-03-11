import mongoose from "mongoose";
const {Schema} = mongoose;
import uuidv4 from "uuid";
const {v4:uuidv4} = uuidv4;

const orderModel = new Schema({
    orderId : {
        type : String,
        default : ()=>uuidv4(),
        unique : true,
        required : true
    }, 
    orderItems : [{

    productId : {
        type : Schema.Types.ObjectId,
        ref : "products",
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
    price : {
        type : Number,
        required : true
    }
    }],
    totalAmount : {
        type : Number,
        required : true
    },
    couponApplied : {
        type : Boolean,
        required : true
    },
    discount : {
        type : Number,
        default : 0
    },
    finalAmount : {
        type : Number,
        required : true
    },
    shippingAddress : {
        type : Schema.Types.ObjectId,
        ref : "addresses",
        required : true
    },
    invoiceDate : {
        type : Date
    },
    deliveryStatus : {
        type : String,
        required : true,
        enum : ["Pending","Processing","Shipped", "Delivered", "Cancelled","Return Request", "Returned"]
    },
    customerId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    paymentId : {
        type : Schema.Types.ObjectId,
        ref : "payments",
        required : true
    }
   
},{timestamps : true})

export default mongoose.module("Order",orderModel)