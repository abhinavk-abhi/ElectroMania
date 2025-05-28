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
        .limit(limit)
        .skip(skip)
      
        const lastIndex = page * limit;
        const slNo = [];
        for(let i = lastIndex - (limit-1); i <= lastIndex ; i++){
            slNo.push(i)
        }

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        res.render('admin/orderList',{orders,
            searchQuery : query,
            currentPage: page,
            totalPages: totalPages,
            slNo
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
        console.log("loadDetails error=>" + error)
    }
}

const updateStatus = async (req,res)=>{
    try {
        const itemId = req.params.itemId;
        const {status , orderId} = req.body
       
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

    //   if (order.orderItems.every(item => item.deliveryStatus === "Delivered")) {
    //     order.paymentStatus = "Paid";
    //     order.deliveredAt = Date.now()
    //   } else {
    //     order.paymentStatus = "Pending";
    //   }
      
      if(order.orderItems.every(item => item.deliveryStatus === "Delivered" && order.paymentMethod == "COD")){
        order.paymentStatus = "Paid"
      }

        productDetails.deliveryStatus =status;

        await order.save();

        res.status(200).json({message : `Status updated to ${status}`,
        selectedStatus : status
    })
    } catch (error) {
        
    }
}

const orderReturn = async (req,res)=>{
    try {
        const {orderId , itemId , status } = req.body

        const order = await Order.findOne({_id : orderId})
        if(!order){
            return res.status(404).json({ error : "Order not found."})
        }

        const product = order.orderItems.find(item=>item._id.toString() === itemId.toString())

        if(!product){
            return res.status(404).json({ error : "Product not found"})
        }

        const reStock = product.quantity;

        const itemTotal = product.quantity * product.price;

        const totalOrderPrice = order.totalAmount;
        const totalDiscount = order.discount;

        const itemDiscountShare = totalOrderPrice === 0 ? 0 : (itemTotal / totalOrderPrice) * totalDiscount;

        const refundAmount = Math.round(itemTotal - itemDiscountShare)

        const productId = product.productId;
        const userId = order.userId;

        if(product.returnStatus === "Approved"){
            return res.status(400).json({ error : "Item already returned." });
        }

        if(status === "Approved"){

            product.returnStatus = status;
            product.returnedAt = new Date();
            product.quantity = 0;
            product.price = 0;
            product.deliveryStatus = "Returned";

            let newPrice = 0;
            for (let i of order.orderItems){
                newPrice += (i.quantity * i.price)
            }

            order.totalAmount = newPrice;
            order.discount = order.discount - itemDiscountShare;

            order.finalAmount = Math.round(newPrice - order.discount)
            // order.paymentStatus = "Refunded"

            let paymentStatus = order.paymentStatus;
            const allReturned = order.orderItems.every(i => i.returnStatus==='Approved');
            if (allReturned) {
                order.orderStatus = 'Returned';
                order.paymentStatus ='Refunded';
                paymentStatus = order.paymentStatus;
            }
      
            await order.save();

            await Product.findOneAndUpdate(
                {_id : productId},
                { $inc :{ stock : reStock }}
            )

            const userUpdate = await User.findOneAndUpdate(
                {_id : userId },
                {
                    $inc : { wallet : refundAmount }
                },
                {new : true}
            );

            return res.status(200).json({ message : "Return Approved.",
                selectedStatus : "Returned",
                paymentStatus : paymentStatus
            })
        }

        if(status === "Rejected"){
            product.returnStatus = status;
            await order.save()

            return res.status(200).json({ message : "Return Rejected",
                selectedStatus : "Return Rejected",
                paymentStatus : paymentStatus
            })
        }

    } catch (error) {
        console.log("Return request process => ",error)
        return res.status(500).json({ message : "Internal server error"})
    }
}

export default {
    loadOrder,
    loadDetails,
    updateStatus,
    orderReturn
}