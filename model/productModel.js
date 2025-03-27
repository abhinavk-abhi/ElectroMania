import mongoose from "mongoose";
const {Schema} = mongoose;

const productModel = new Schema({
    productId : {
        type : String,
        unique : true,
    },
    name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    brand : {
        type : String,
        required : true
    },
    specification : {
        type : String,
        required : true
    },
    images : {
        type : [String],
        required : true
    },
    price : {
        type : Number ,
        required : true
    },
    stock : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        required : false,
        enum : ["Available","Out of stock","Unavailable"],
        default : "Available"
    },
    productOffer : {
        type : String,
        default : 0
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    category : {
        type : Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    reviewCount : {
        type : Number,
        default : 0
    }
    
},{timestamps : true})

export default mongoose.model("product",productModel)