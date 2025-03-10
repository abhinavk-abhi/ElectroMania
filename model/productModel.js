import mongoose from "mongoose";
const {Schema} = mongoose;

const productModel = new Schema({
    productName : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    images : {
        type : String,
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
    discountPrice : {
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
    }
},{timestamps : true})

export default mongoose.model("product",productModel)