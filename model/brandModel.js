import mongoose from "mongoose";
const {Schema} = mongoose;

const brandModel = new Schema({
    
    brandName : {
        type : String,
        required : true
    }
},{timestamps : true})

export default mongoose.model("Brand",brandModel)