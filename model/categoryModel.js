import mongoose from "mongoose";
const {Schema} = mongoose;

const categoryModel = new Schema({
    productId : {
        type : Schema.Types.ObjectId,
        ref : "products",
        required : true
    },
    categoryName : {
        type : String,
        required : true
    },
    categoryDescription : {
        type : String,
        required : true
    },
    thumbnail : {
        type : String,
        required : true
    },
    visibility : {
        type : String,
        required : true,
        enum : ["Active", "inActive"]
    },
    discountOffers : {
        type : Number,
        required : true
    }
},{timestamps : true})

export default mongoose.model("Category",categoryModel)