import mongoose from "mongoose";
const {Schema} = mongoose;

const brandModel = new Schema({
    productId : {
        type: Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    brandName : {
        type : String,
        required : true
    }
},{timestamps : true})

export default mongoose.model("Brand",brandModel)