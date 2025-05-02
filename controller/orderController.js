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
      
        res.render('user/orderDetail',{order : order})
    } catch (error) {
        
    }
}

const cancelItem = async (req,res)=>{
    try {
        
        const user =  req.session.user || req.user;
        const userId = user._id
        const { orderId , itemId , reason } = req.body;

        const order = await Order.findOne({_id : orderId}).populate("orderItems.productId")

        if(!order) {
            return res.status(404).send("Order not found.")
        }

        const item = order.orderItems.find(i=> i._id.toString() == itemId);
        console.log("orde====>>>>>>>>"+order)
        if(!item){
            return res.status(404).send("Product not found in the order")
        }

        const reStock = item.quantity;
        const itemTotal = item.quantity * item.price;

        const totalOrderPrice = order.totalAmount;
        const totalDiscound = order.discount;

        const itemDiscoundShare = totalOrderPrice === 0 ? 0 : (itemTotal / totalOrderPrice) * totalDiscound;
        const refundAmount = Math.round(itemTotal - itemDiscoundShare)

      

        // if(order.paymentMethod === "ONLINE" && order.paymentStatus === "Paid"){
        //     await User.findOneAndUpdate(
        //         {_id : userId},
        //         {
        //             $inc : { wallet : refundAmount },

        //         },
        //         { new : true }
        //     )
        // }

       

        await Product.findOneAndUpdate(
            {_id : item.productId},
            { $inc : { stock : reStock} }
        );

        item.quantity = 0;
        item.price = 0;
        item.deliveryStatus = "Cancelled"
        item.cancelled = true;
        item.cancelReason = reason;
        item.cancelledAt = new Date();

        let newTotalPrice = 0;
        for( const i of order.orderItems){
            newTotalPrice = i.quantity * i.price
        }

        order.totalAmount = newTotalPrice;
        order.discount = order.discount - itemDiscoundShare;
        order.finalAmount = Math.round(newTotalPrice - order.discount)

        await order.save()


        // ---- If all items cancelled, cancel the whole order ---- //
        const allCancelled = orderDetails.orderedItems.every(i => i.cancelled);
        if (allCancelled) {
            orderDetails.orderStatus = 'Cancelled';
            await order.save();
        }

        return res.status(200).json({ message: "Item cancelled successfully" });



    } catch (error) {
        console.log("cancelItem --->"+error)
    }
}


const returnOrder = async (req,res)=>{
    console.log("qwertyuiopqwertyuiop")
    try {
        
        const { orderId , itemId , returnReason } = req.body;

        const order = await Order.findOne({ _id : orderId }).populate("orderItems.productId")

        if(!order){
            console.log("Order details for return is not found, orderId :" , orderId)
            return res.status(404).json({ message : "Something Went wrong with order" })
        }

        const productToBeReturned = order.orderItems.find(item=>
            item._id.toString() === itemId.toString()
        )

        if(!productToBeReturned){
            console.log("failed to find product inside the order, ProductId:", productId);
            return res.status(404).json({ message: "Failed to fetch the product Details" });
        }

        productToBeReturned.returnReason = returnReason;
        productToBeReturned.returnStatus = 'Pending';

        await order.save();
        return res.status(200).json({ message: "Return requested" });

    } catch (error) {
        console.error("failed to send return request", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export default {
    loadOrders,
    orderDetail,
    cancelItem,
    returnOrder
}