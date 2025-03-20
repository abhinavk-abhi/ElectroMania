import mongoose from "mongoose";
const {Schema} = mongoose;

const categoryModel = new Schema({
  
    name : {
        type : String,
        required : true,
        unique : true
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