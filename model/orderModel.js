import mongoose from "mongoose";
const {Schema} = mongoose;


const orderModel = new Schema({
    orderId : {
        type : String,
        unique : true,
        required : true
    }, 
    orderItems : [{

    productId : {
        type : Schema.Types.ObjectId,
        ref : "product",
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
        ref : "addresse",
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

export default mongoose.model("Order",orderModel)