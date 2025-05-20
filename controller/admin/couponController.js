import Coupon from '../../model/couponModel.js'
import User from '../../model/userModel.js'


const loadCoupons = async (req,res)=>{
    try {
        const searchQuery = req.query.q || ''
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const coupons = await Coupon.find({name : {$regex : searchQuery , $options : "i"}}).sort({createdAt : -1}).skip(skip).limit(limit)

        const totalCoupons = await Coupon.countDocuments({name : {$regex : searchQuery , $options : "i"}});
        
        const totalPages = Math.ceil(totalCoupons/limit);

        res.render('admin/coupons',{coupons,
            errorMessage : "",
            currentPage : page ,
            totalPages : totalPages ,
            totalCoupons : totalCoupons,
            selectedFilter : "",
            searchQuery : searchQuery
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({error : "Failed to load coupons"})
    }
}

const addCoupon = async (req,res)=>{
    try {
        
        const { addName , addCode , addDescription , addStartDate , addExpiryDate , addMinPrice , addOfferPrice , addUsageType } = req.body;

        if(new Date(addStartDate) >= new Date(addExpiryDate)){
            return res.status(401).json({error : "Expiry date should have to be greater than Start date"})
        }

    } catch (error) {
        
    }
} 

export default {
    loadCoupons,
    addCoupon
}