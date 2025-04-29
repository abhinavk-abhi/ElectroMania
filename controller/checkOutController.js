import User from '../model/userModel.js'
import Cart from '../model/cartModel.js'
import Address from '../model/addressModel.js'
import Order from '../model/orderModel.js'
import Coupon from  '../model/couponModel.js'
import {nanoid} from 'nanoid'


const loadCheckOut = async (req,res)=>{
    try {
        
    const {cartId,userId} = req.query;
    

    const user = await User.findOne({_id:userId})
    const address = await Address.find({userId})
    const cart = await Cart.findOne({userId}).populate('items.productId')
   

    let cartTotal = 0;
    let deliveryCharge = 0;
    let grandTotal = 0;

    if(cart && cart.items.length > 0){
        cartTotal = cart.items.reduce((acc,item)=> acc + item.quantity * item.price ,0)
        deliveryCharge = cartTotal < 599 ? 40 : 0;
        grandTotal = cartTotal + deliveryCharge;
    }

    const currentDate = Date.now();

    const coupons = await Coupon.find({
        status : 'Active',
        startDate : { $lte : currentDate},
        expiryData : { $gte : currentDate},
        minPricee : { $lte : grandTotal}
    });

    res.render('user/checkout' , { coupons , user , address , cart , calculatedValues : { cartTotal , deliveryCharge , grandTotal }})


    } catch (error) {
        console.log(error)
    }
}

const placeOrder = async (req,res)=>{
    try {
        const {cartId,userId,addressId,addressDetailIndex,paymentMethod,couponCode} = req.body;
        console.log(req.body)

        const user = await User.findOne({_id:userId})
        const cart = await Cart.findOne({userId})
        const address = await Address.findOne({_id : addressId})
        const selectedAddress = address.details[addressDetailIndex]
      

    } catch (error) {
        
    }
}

export default {
    loadCheckOut,
    placeOrder
}