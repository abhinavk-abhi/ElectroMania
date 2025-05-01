import Order from '../model/orderModel.js'
import User from '../model/userModel.js'
import Address from '../model/addressModel.js'
import Product from '../model/productModel.js'

const loadOrders = async (req,res)=>{
    try {
        
        const userId = req.session.user._id || req.user._id

        if(!userId){
            return res.status(400).json({ error : "User details is not available."})
        }
        const orders = await Order.find({userId : userId}).sort({createdAt : -1 }).populate("orderItems.productId")
        res.render('user/userOrder',{
            orders : orders,    
        })

    } catch (error) {
        console.log("load orders error=> "+ error)

    }
}

const orderDetail = async (req,res)=>{
    try {
        const orderId = req.params.orderId;
       
        const order = await Order.findOne({_id : orderId}).populate("orderItems.productId")
        console.log(order)

        res.render('user/orderDetail',{order : order})
    } catch (error) {
        
    }
}

export default {
    loadOrders,
    orderDetail
}