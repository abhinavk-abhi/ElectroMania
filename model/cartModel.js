import mongoose, { trusted } from "mongoose";
const {Schema} = mongoose;

const cartModel = new Schema ({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "users",
        required : true
    },

    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        productImage: {
            type: String
        },
        stock: {
            type: Number
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        basePrice: {
            type: Number,
            required: true
        }
    }]
    
   
},{timestamps : true})

export default mongoose.model("Cart",cartModel)