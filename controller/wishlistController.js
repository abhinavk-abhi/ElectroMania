import Wishlist from "../model/wishlistModel.js"
import Cart from "../model/cartModel.js"
import User from "../model/userModel.js"
import Product from "../model/productModel.js"

const addToWishlist = async (req,res)=>{
    try {
       
        const {userId,productId} = req.body;
        console.log(req.body)

        if(!userId){
            return res.status(401).json({message : "Please login to continue."})
        }

        if(!productId){
            return res.status(404).json({message : "Product not found."})
        }

        const wishlist = await Wishlist.findOne({userId : userId})

      



    

    } catch (error) {
        
    }
}

const loadWishlist = async (req,res)=>{
    try {
       if(!req.session.user){
                  return res.redirect('/user/login')
              }
      
              const userId = req.session.user?.id ?? req.session.user?._id ?? null ;
      
              const user = await User.findOne({_id : userId});

              const wishlist = await Wishlist.findOne({userId : userId}).populate('products.productId')

              if(wishlist){
                return res.render('wishlist',{wishlist , user })
              } else {
                await Wishlist.findOneAndUpdate(
                    {userId},
                    {products : []},
                    {upsert : true , new : true}
                )
                return res.render('wishlist' , {wishlist : null , user })
              }

    } catch (error) {
        
    }
}

export default {
    addToWishlist
}