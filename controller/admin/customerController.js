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
    .limit(limit)
    // console.log(customers)

    const totalCustomers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / limit)

    res.render("admin/customers",{
        title : "Customers",
        errorMessage : "",
        customer : customers,
        currentPage : page,
        totalPages : totalPages,
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

const userBlock = async (req,res)=>{
    try {
    const id = req.query.users;
    const {isBlocked} = req.body;
    

    const customer = await User.findOne({userId:id})
    
    if(!customer){
        return res.status(404).json({error : "Customer not found"})
    }

    customer.isBlocked = isBlocked;
    await customer.save()
    res.status(200).json({message : "Status update successfully."})
    } catch (error) {
        console.log("Error updating status :" ,error);
        res.status(302).json({error : "Unexpected error occured"})
    }

}

const filterCustomers = async (req,res)=>{
    try {
        const {isBlocked} = req.query;
        let filter = {};

        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page -1) *  limit;

        if(isBlocked === 'true') {
          filter.isBlocked = true;
        }else if(isBlocked === 'false'){
            filter.isBlocked = false
        }

        const customers = await User.find(filter)
        .sort({createdAt : -1})
        .skip(skip)
        .limit(limit)

        const totalCustomers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalCustomers/limit);

        res.render('admin/customers',{
            title : "Customers",
            errorMessage : "",
            customers,
            currentPage : page,
            totalPages : totalPages,
            selectedFilter : isBlocked !== undefined ? isBlocked : "all",
            searchQuery : "",
        });
    } catch (error) {
        console.log("Filter error:",error);
        res.status(500).json({error : "Unexpected error occured"})
        
    }
}

export default {
    userInfo,
    userBlock,
    filterCustomers
}