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
    images : {
        type : [String],
        required : true
    },
    basePrice : {
        type : Number ,
        required : true
    },
    discountPercentage : {
        type : Number,
        required : true
    },
    stock : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        required : true,
        enum : ["active","inActive"]
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
    
},{timestamps : true})

export default mongoose.model("product",productModel)