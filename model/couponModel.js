import mongoose from "mongoose";
const {Schema} = mongoose;

const couponModel = new Schema({
    categoryId : {
        type : Schema.Types.ObjectId,
        ref : "category",
        required : true
    },
    couponName : {
        type : String,
        required : true,
        unique : true
    },
    couponCode : {
        type : String,
        required : true,
        unique : true
    },
    createdOn : {
        type : Date,
        default : Date.now,
        required : true
    },
    expiryDate : {
        type : Date,
        required : true
    },
    discountPrice : {
        type : Number,
        required : true
    },
    minimumPrice : {
        type : Number,
        required : true
    },
    isList : {
        type : Boolean,
        default : true
    },
    userId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    limit : {
        type : Number,
        required : true
    },
   
},{timestamps : true})

export default mongoose.model("Coupon",couponModel)