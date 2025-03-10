import mongoose from "mongoose";
const {Schema} = mongoose;

const orderModel = new Schema({
    productId : {
        type : Schema.Types.ObjectId,
        ref : "products",
        required : true
    },
    customerId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    productReview : {
        type : Schema.Types.ObjectId,
        ref : "reviews",
        required : true
    },
    paymentId : {
        type : Schema.Types.ObjectId,
        ref : "payments",
        required : true
    },
    orderId : {
        type : Number,
        required : true
    },
    totalAmount : {
        type : Number,
        required : true
    },
    deliveryStatus : {
        type : String,
        required : true,
        enum : ["Shipped", "Delivered", "Pending", "Returned"]
    },
    deliveryDetails : {
        type : String
    },
    couponApplied : {
        type : Boolean,
        required : true
    },
    shippingAddress : {
        type : Schema.Types.ObjectId,
        ref : "addresses",
        required : true
    }
},{timestamps : true})

export default mongoose.module("Order",orderModel)