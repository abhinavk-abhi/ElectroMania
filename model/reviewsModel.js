import mongoose from "mongoose";
const {Schema} = mongoose;

const reviewsModel = new Schema({
    productId : {
        type : Schema.Types.ObjectId,
        ref : "products",
        required : true
    },
    customerId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    reviewMessage : {
        type : String,
        required : true
    }
})

export default mongoose.model("reviews",reviewsModel)