import mongoose from "mongoose";
const {Schema} = mongoose;


const orderModel = new Schema({
    orderId : {
        type : String,
        unique : true,
        required : true
    }, 

    userId : {
        type : Schema.Types.ObjectId,
        ref : "user",
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
        required : false
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
        type : Object,
        required : true
    },

    invoiceDate : {
        type : Date
    },

    deliveryStatus : {
        type : String,
        default : "Pending",
        enum : ["Pending","Processing","Shipped", "Delivered", "Cancelled","Return Request", "Returned"]
    },

    
    paymentStatus : {
        type : String,
        default :  "Pending",
        enum : ["Paid" , "Pending" , "Failed" , "Refunded"]
    },

    PaymentMethod : {
        type : String,
        enum : ["COD" ,"RAZORPAY" , "PAYPAL" , "WALLET" ]
    }
    
  
   
},{timestamps : true})

export default mongoose.model("Order",orderModel)