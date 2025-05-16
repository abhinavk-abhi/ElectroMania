import Wishlist from "../model/wishlistModel.js";
import Cart from "../model/cartModel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Please login to continue." });
    }

    if (!productId) {
      return res.status(404).json({ error: "Product not found." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const existingItem = await Wishlist.findOne({
      userId: userId,
      products: productId,
    });

    if (existingItem) {
      return res
        .status(400)
        .json({ error: "Product is already in the wishlist" });
    }

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: "Product added to wishlist." });
  } catch (error) {
    console.log("addToWishlistErrro =>" + error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const loadWishlist = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/user/login");
    }

    const userId = req.session.user?.id ?? req.session.user?._id ?? null;

    const user = await User.findOne({ _id: userId });

    const wishlist = await Wishlist.findOne({ userId: userId }).populate('products');

    if (wishlist) {
      return res.render("user/wishlist", { wishlist, user });
    } else {
      await Wishlist.findOneAndUpdate(
        { userId },
        { products: [] },
        { upsert: true, new: true }
      );

    
      return res.render("user/wishlist", { wishlist: {}, user });
    }
  } catch (error) {
    console.log("loadWishlist error => "+ error)
    return res.status(500).json({ error : "Internal server error"})
  }
};

const remove = async(req,res)=>{
  try{
  const { userId , productId } = req.body;

  const wishlist = await Wishlist.findOne({userId : userId})

 if(!wishlist){
  return res.status(404).json({error : "Failed to fetch wishlist!"})
 }

const index = await wishlist.products.indexOf(productId);


 wishlist.products.splice(index,1)

 await wishlist.save()

 return res.status(200).json({ message : "Product removed from wishlist!"})

} catch (error) {
  console.log(error)
  return res.status(500).json({ error : "Internal server error"})
}
}



export default {
  addToWishlist,
  loadWishlist,
  remove
};
