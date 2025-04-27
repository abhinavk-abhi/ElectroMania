import mongoose, { mongo } from "mongoose";
const {Schema} = mongoose;

const wishlistModel = new Schema ({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    products : [{
        type : Schema.Types.ObjectId,
        ref : "products" ,
        required : true
    }],
    
},{timestamps : true})

export default mongoose.model("wishlist",wishlistModel)