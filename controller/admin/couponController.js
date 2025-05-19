import Coupon from '../../model/couponModel.js'


const loadCoupons = async (req,res)=>{
    try {
        const coupons = await Coupon.find({status : "Active"})
        res.render('admin/coupons',{coupons})
    } catch (error) {
        console.log(error)
        res.status(500).json({error : "Failed to load coupons"})
    }
}

export default {
    loadCoupons
}