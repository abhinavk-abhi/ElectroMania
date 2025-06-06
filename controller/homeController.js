import User from '../model/userModel.js'
import Product from '../model/productModel.js'
import Category from '../model/categoryModel.js'



const loadHome = async (req,res)=>{
    try {
        const limit = 8;
        const user = req.session.user || req.user;
        const product = await Product.aggregate([
            {
                $lookup : {
                    from : 'categories',
                    localField : 'category',
                    foreignField : '_id',
                    as : 'category'
                }
            },
                
                {$match:{
                    "category.visibility" : true
                }},

                {
                    $limit : limit
                }
            
        ])

        if(user){
            const userData = await User.findOne({_id:user})
            res.render('home',{user:userData,
                products : product
            })
        }else{
        return res.render('home.ejs',{products : product})
        }
    } catch (error) {
        console.log(error)
        console.log('Home page not found')
        res.status(500).send('Server error')
    }
}

const loadRegister = async (req,res)=>{
    try {
        res.render('user/register',{errorMessage:" "})
    }catch(error){
        console.log('Register page not found')
        res.status(500).send('Server error')
    }
}

const loadShop = async (req,res)=>{
    try {
        const userId = req.session.user?.id ?? req.session.user?._id ?? null;
        const user = await User.findOne({_id:userId}) 

        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page-1)*limit;
        let filter = {visibility : true}
        
        if(req.query.result){
            filter.name = {$regex : req.query.result , $options : "i"}
        }

        if(req.query.category){
            let categories = Array.isArray(req.query.category)?req.query.category:[req.query.category]

            const matchedCategories = await Category.find({
                name:{$in : categories},
                visibility : true
            }).select('_id');

            if(matchedCategories.length){
                filter.category = {$in : matchedCategories.map(cat => cat._id)}
            }
        }

        if(req.query.brand){
            let brands = Array.isArray(req.query.brand)?req.query.brand : req.query.brand.includes(',')?req.query.brand.split(','):[req.query.brand]
            filter.brand = {$in : brands}
        }

        if(req.query.price){
            filter.price = {$lte : parseInt(req.query.price)}
        }

        if(req.query.availability){
            filter.stock = {$gt : 0}
        }

        const sortOption = req.query.sort || "newest" ;
        let sortQuery = {}

        switch(sortOption){
            case "priceLowToHigh" :
                sortQuery = {price : 1}
                break;
            case "priceHighToLow" : 
                sortQuery = {price : -1}
                break;
            case "aToZ" :
                sortQuery = {name : 1}
                break;
            case "zToA" :
                sortQuery = {name : -1}
                break;
            case "ratingHighToLow" :
                sortQuery = {rating : -1}
                break;
            default :
                sortQuery = {createdAt : -1}
        }

        const product = await Product.aggregate([
            {$match : filter},
            {
                $lookup : {
                    from : 'categories',
                    localField : 'category',
                    foreignField : '_id',
                    as : 'category'
                }
            },
           {$match:{
                    "category.visibility" : true
                }},
            {$sort : sortQuery},
            {$skip : skip},
            {$limit : limit}
        ])

        const categories = await Category.find({visibility : true});
        const brand = await Product.distinct("brand");
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts/limit)

        res.render("shop",{
            products : product,
            category : categories,
            brand : brand,
            appliedFilters : req.query,
            currentPage : page,
            totalPages,
            sortOption,
            user
        });

    } catch (error) {
     console.log("loadShop Error :",error)
    return  res.status(500).send("Error fetching the products")  
    }
}


const loadProductDetails = async (req,res)=>{
    try {

        const userId = req.session.user?.id ?? req.session.user?._id ?? null;
        const user = await User.findOne({_id:userId}) 

        const productId = req.params.productId;
        const product = await Product.findOne({_id : productId})

        const category = product.category;
        const relatedProducts = await Product.find({
            category : category,
            _id : {$ne : product._id}
        })
       

        if(!product){
            return res.render('shop',{message : "Product is unavailable"})
        }

        res.render('productDetails',{
            product : product,
            relatedProducts : relatedProducts,
            user : user
        })
    } catch (error) {
        
    }
}
export default {loadHome,loadRegister,loadShop , loadProductDetails};