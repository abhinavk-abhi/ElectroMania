import Order from '../../model/orderModel.js'
import User from '../../model/userModel.js'

const loadOrder = async (req,res)=>{
    try {
        const filter = {};
        const query = req.query.query;
        if (query) {
            const searchRegex = new RegExp(req.query.query, "i");
            filter.name = searchRegex;
          }
        const orders = await Order.find(filter).populate('userId');
        res.render('admin/orderList',{orders,
            searchQuery : query
        })

    } catch (error) {
        console.log("adminOrder error => "+error)
    }
}


export default {
    loadOrder
}