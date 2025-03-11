import mongoose, { trusted } from "mongoose";
const {Schema} = mongoose;

const cartModel = new Schema ({
    customerId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },

    items : [{
    productId : {
        type : Schema.Types.ObjectId,
        ref : "products",
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    totalPrice : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        default : 'Placed'
    },
    cancellationReason : {
        type : String,
        default : 'none'
    }
}],
   
},{timestamps : true})

export default mongoose.model("Cart",cartModel)