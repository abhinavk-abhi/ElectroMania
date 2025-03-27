import mongoose from "mongoose";
const {Schema} = mongoose;

const categoryModel = new Schema({
  
    name : {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true
    },
    visibility : {
        type : Boolean,
        required : true,
    },
    itemsCount : {
        type : Number,
        default : 0
    }
},{timestamps : true})

export default mongoose.model("Category",categoryModel)