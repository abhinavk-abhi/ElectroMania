import Wishlist from "../model/wishlistModel.js"
import Cart from "../model/cartModel.js"
import User from "../model/userModel.js"
import Product from "../model/productModel.js"

const addToWishlist = async (req,res)=>{
    try {
       
        const {userId,productId,price,basePrice} = req.body;
        

    } catch (error) {
        
    }
}

export default {
    addToWishlist
}