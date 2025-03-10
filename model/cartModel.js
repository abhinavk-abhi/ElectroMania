import mongoose from "mongoose";
const {Schema} = mongoose;

const cartModel = new Schema ({
    quantity : {
        type : Number,
        required : true
    },
    productId : {
        type : Schema.Types.ObjectId,
        ref : "products",
        required : true
    },
    customerId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    }
},{timestamps : true})

export default mongoose.model("Cart",cartModel)