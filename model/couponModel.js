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
        required : true
    },
    couponCode : {
        type : String,
        required : true,
        unique : true
    },
    activateDate : {
        type : date,
        required : true
    },
    expiryDate : {
        type : date,
        required : true
    },
    limit : {
        type : Number,
        required : true
    },
    discountPrice : {
        type : Number,
        required : true
    }
},{timestamps : true})

export default mongoose.model("Coupon",couponModel)