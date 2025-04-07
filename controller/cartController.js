import Products from '../model/productModel.js'
import User from '../model/userModel.js'
import Cart from '../model/cartModel.js'

const addToCart = async (req,res)=>{
    try {
     const {userId , productId , quantity , price , basePrice } = req.body;
  

     if (!userId) {
        return res.status(401).json({ error: 'Please log in to add items to your cart.' });
    }

    if (!productId || !quantity || !price || quantity <= 0 || price <= 0) {
        return res.status(404).json({ error: 'Invalid input values.' });
    }

    const product = await Products.findOne({ _id: productId, visibility: true });
    if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
    }

    const user = await User.findOne({_id : userId})
  

    let availableStock = product.stock;

    if(quantity > availableStock){
        return res.status(404).json({error : `Only ${availableStock} units of ${product.name} available in stock`})
    }

    const item = {
        name : product.name,
        brand : product.brand,
        productId : product._id,
        quantity : parseInt(quantity),
        price,
        basePrice,
        stock : availableStock,
        productImage : product.images[0]
    }

    const cart = await Cart.findOneAndUpdate(
        {userId , 'items.productId' : productId},
        {
            $inc : {'items.$.quantity' : quantity},
            $set : {'items.$.price' : price}
        },
        { new : true }
    );

    if(!cart) {
        await Cart.findOneAndUpdate(
            {userId},
            {$push : {items : item}},
            {upsert : true , new : true }
        );
    }

    // await Promise.all([
    //     Wishlist.findOneAndDelete({ product : productId }),
    //     User.findByIdAndUpdate(userId, {$set : { cart : cart?._id}})
    // ])

    return res.status(200).json({message : 'Product added to cart successfully'})

    } catch (error) {
      console.log("Add to cart error",error)
      return res.status(500).json({error : 'Failed to add items to  cart'})
    }
  }

  const loadCart = async (req,res)=>{
    try {
        
        if(!req.session.user){
            return res.redirect('/user/login')
        }

        const userId = req.session.user?.id ?? req.session.user?._id ?? null ;

        const user = await User.findOne({_id : userId});

        const cart = await Cart.findOne({ userId : userId}).populate('items.productId')

        if(!cart){
            res.render('user/cart',{cart : null , user})
        }

        res.render('user/cart',{ cart , user})

    } catch (error) {
        console.log("Error fetching the cart :", error)
        res.status(500).json({error : "Failed to fetch the cart"})
    }
  }


  export default  {
    addToCart,
    loadCart
  }