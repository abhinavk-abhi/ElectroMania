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
        ref : "User",
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
    },
    deliveryStatus : {
        type : String,
        default : "Pending",
        enum : ["Pending","Processing","Shipped", "Out for delivery","Delivered", "Cancelled","Return Request", "Returned"]
    },

    returnedAt: { type: Date, default: null },

    returnStatus: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },

    returnReason: { type: String, default: '' },

    cancelled: { type: Boolean, default: false },

    cancelledAt: { type: Date, default: null },
    
    cancelReason: { type: String, default: '' }

    }],

    deliveyCharge : {
        type : Number ,
        required : false,
    },

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

    paymentStatus : {
        type : String,
        default :  "Pending",
        enum : ["Paid" , "Pending" , "Failed" , "Refunded"]
    },

    paymentMethod : {
        type : String,
        enum : ["COD" ,"RAZORPAY" , "PAYPAL" , "WALLET" ]
    },

    deliveredAt : {
        type : Date ,
        default : null,
        required : false
    },  
    razorpayOrderId: {
        type: String,
     default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    }     
  
},{timestamps : true})

export default mongoose.model("Order",orderModel)