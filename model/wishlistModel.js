import mongoose, { mongo } from "mongoose";
const {Schema} = mongoose;

const wishlistModel = new Schema ({
    productId : [{
        type : Schema.Types.ObjectId,
        ref : "products" ,
        required : true
    }],
    customerId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    }
},{timestamps : true})

export default mongoose.model("wishlist",wishlistModel)