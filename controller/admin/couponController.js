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
        
        const { addName , addCode , addDescription , addStartDate , addExpiryDate , addMinPrice , addOfferPrice , addStatus , addUsageType } = req.body;

        const coupon = await Coupon.findOne({name : addName})
        if(coupon){
            return res.status(400).json({ error : "Coupon in this name already exists."})
        }

        if(new Date(addStartDate) >= new Date(addExpiryDate)){
            return res.status(401).json({error : "Expiry date should have to be greater than Start date"})
        }

        if(parseFloat(addMinPrice) < parseFloat(addOfferPrice)){
            return res.status(400).json({error :  "Minimum price must have to be greater than offer price."})
        }

        await Coupon.create({
            name : addName,
            code : addCode,
            description : addDescription,
            startDate : addStartDate,
            expiryDate : addExpiryDate,
            minPrice : addMinPrice,
            offerPrice : addOfferPrice,
            status : addStatus,
            usageType : addUsageType
        })

         return res.status(200).json({ message: 'Coupon added successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error : "Internal server error"})
    }
} 

const editCoupon = async (req,res)=>{
    try {
        
    const {orgName, editName, editCode, editDescription, editStartDate, editExpiryDate, editMinPrice, editOfferPrice, editStatus, editUsageType} = req.body;

    // const coupon = await Coupon.findOne({name : editName})
    // if(coupon){
    // return res.status(400).json({ error : "Coupon in this name already exists."})
    //     }

    if(new Date(editStartDate) >= new Date(editExpiryDate)){
        return res.status(400).json({ error : "Expiry date should have to be greater than Start date"})
    }

    if(parseFloat(editMinPrice) < parseFloat(editOfferPrice)){
        return res.status(400).json({ error :"Minimum price must have to be greater than offer price." })
    }

    const coupon = await Coupon.findOneAndUpdate(
        {name : orgName},
        {
            name : editName,
            code : editCode,
            description : editDescription,
            startDate : editStartDate,
            expiryDate : editExpiryDate,
            minPrice : editMinPrice,
            offerPrice : editOfferPrice,
            status : editStatus,
            usageType : editUsageType
        },
        { new : true }
    )

    if(coupon) {
        return res.status(200).json({ message : "Coupon updated successfully"})
    } else {
        return res.status(400).json({ error : "Coupon update failed"})
    }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error : "Internal server error" })
    }
}

export default {
    loadCoupons,
    addCoupon,
    editCoupon
}