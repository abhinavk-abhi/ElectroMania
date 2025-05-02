import Order from '../../model/orderModel.js'
import User from '../../model/userModel.js'
import Product from '../../model/productModel.js'

const loadOrder = async (req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;
        const filter = {};
        const query = req.query.query;
        if (query) {
            const searchRegex = new RegExp(req.query.query, "i");
            filter.orderId = searchRegex;
          }
        const orders = await Order.find(filter)
        .populate('userId')
        .sort({createdAt : -1})
        .skip(skip)
        .limit(limit)

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        res.render('admin/orderList',{orders,
            searchQuery : query,
            currentPage: page,
            totalPages: totalPages,
        })

    } catch (error) {
        console.log("adminOrder error => "+error)
    }
}

const loadDetails = async (req,res)=>{
    try {
        const orderId = req.params.orderId;

        const order = await Order.findOne({_id : orderId}).populate('orderItems.productId')
        

        res.render('admin/adminOrderDetails',{order})
    } catch (error) {
        
    }
}

const updateStatus = async (req,res)=>{
    try {
        const itemId = req.params.itemId;
        const {status , orderId} = req.body
        console.log(itemId)
        console.log(req.body)
       
        const order = await Order.findOne({_id : orderId})

        if(!order){
            return res.status(404).json({error : "Failed to find order"})
        }

        const productDetails= order.orderItems.find(item=>item._id.toString()===itemId.toString());

        if(!productDetails){
            return res.status(404).json({error : "Failed to find the order"})
        }

        if(productDetails.deliveryStatus === status){
            return res.status(400).json({
                error : `Order is already marked as ${status}. No changes made.`
            })
        }

        const statusFlow =  ["Pending","Processing","Shipped", "Out for delivery","Delivered"]

        const currentIndex = statusFlow.indexOf(productDetails.deliveryStatus);
        const newIndex = statusFlow.indexOf(status)

         
        if (newIndex < currentIndex) {
        return res.status(400).json({
          success: false,
          error : `Invalid status update. Cannot change status from "${productDetails.deliveryStatus}" to "${status}".`
        });
      }

      if (order.orderItems.every(item => item.deliveryStatus === "Delivered")) {
        order.paymentStatus = "Paid";
        order.deliveredAt = Date.now()
      } else {
        order.paymentStatus = "Pending";
      }
      

        productDetails.deliveryStatus =status;

        await order.save();

        res.status(200).json({message : `Status updated to ${status}`,
        selectedStatus : status
    })
    } catch (error) {
        
    }
}

export default {
    loadOrder,
    loadDetails,
    updateStatus,
    
}