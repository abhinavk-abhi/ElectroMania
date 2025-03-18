import User from '../../model/userModel.js'

const userInfo = async  (req,res)=>{
    try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page-1) * limit;
    const filter = {}

    //Apply filter based on isBlocked value from query

    if(req.query.isBlocked === "true"){
        filter.isBlocked = true;
    }else if(req.query.isBlocked === "false"){
        filter.isBlocked = false;
    }

    //Search

    if(req.query.query){
        const search = new RegExp(req.query.query , "i")
        filter.name = search;
    }

    //Fetch filtered and searched users

    const customers = await User.find(filter)
    .sort({createdAt : -1})
    .skip(skip)
    .limit(limit);

    const totalCustomers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / limit)

    res.render("admin/customers",{
        title : "Customers",
        errorMessage : "",
        customer : customers,
        currentPage : page,
        totalPage : totalPages,
        totalCustomer : totalCustomers,
        selectedFilter : req.query.isBlocked || " ",
        searchQuery : req.query.query || " "
    
    });
    } catch (error) {
       console.log("User info fetching error", error);
       res.status(302).json({
        success : false,
        message : "Unexpected error occured while loading the page. Please try again.",
        redirectUrl : '/admin/dashboard'
       }) 
    }
}

export default {
    userInfo
}