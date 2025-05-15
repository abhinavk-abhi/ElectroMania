import User from '../model/userModel.js'
import Cart from '../model/cartModel.js'
import Address from '../model/addressModel.js'
import Order from '../model/orderModel.js'
import Coupon from  '../model/couponModel.js'
import Product from '../model/productModel.js'
import { customAlphabet } from 'nanoid';



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
        if(!user){
            return res.status(400).json({error : "User not found."})
        }
        const cart = await Cart.findOne({userId});
        if(!cart){
            return res.status(400).json({error : "User cart not found."})
        }
        const address = await Address.findOne({_id : addressId})
        if(!address){
            return res.status(400).json({error : "User address not found"})
        }
        const selectedAddress = address.details[addressDetailIndex]
        if(!selectedAddress){
            return res.status(400).json({error : "Selected address not found"})
        }

        let totalAmount = 0;
        for(let item of cart.items){
            totalAmount += (item.price * item.quantity)
        }

        for (let item of cart.items){
             await Product.findOneAndUpdate({_id : item.productId},
                {$inc : {stock : -item.quantity}}
            )
        }


        const generateOrderId = () => {
          
            const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
            return `ORD-${nanoid()}`;
          };

          let deliveryCharge = 0;
          if(totalAmount > 500){
            deliveryCharge = 50;
          }
          

    const orderId = await generateOrderId()

    const newOrder = new Order ({
        orderId,
        userId,
        orderItems : cart.items.map(item=>{
            return {
                productId : item.productId,
                quantity : item.quantity,
                price : item.price
            }
        }),
        deliveryCharge,
        totalAmount,
        finalAmount : totalAmount,
        shippingAddress : selectedAddress,
        invoiceDate: Date.now(),
        paymentStatus : paymentMethod === "COD" ? "Pending" : "Paid",
        paymentMethod

    });

    await newOrder.save();

    console.log("order created");


    cart.items = [];
    await cart.save();
    console.log("cart cleared")


    res.status(201).json({
        
        message: "Order placed successfully",
        orderId : orderId,
        success : true
    });

    } catch (error) {
        console.log("placeOrder error => "+error)
        res.status(500).json({error : "Internal server error."})
    }
}

const orderSuccess = async (req,res)=>{
    try {
        const orderId = req.query;
        const user =  req.session.user || req.user 
        res.render('user/orderSuccess',{
            orderId : orderId,
            user : user
        })
    } catch (error) {
        console.log("loading successPage error=> " + error)
    }
}

export default {
    loadCheckOut,
    placeOrder,
    orderSuccess
}