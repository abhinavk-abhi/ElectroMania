import Category from '../../model/categoryModel.js';


const categoryInfo = async (req,res)=>{
    try {
        const searchQuery = req.query.q || "";

        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const categoryData = await Category.find({name : {$regex : searchQuery , $options : "i"}}).sort({createdAt : -1}).skip(skip).limit(limit);

        const totalcategories = await Category.countDocuments({name : {$regex : searchQuery , $options : "i"}});

        const totalPages = Math.ceil(totalcategories/limit);

        res.render('admin/categories',{title : "categories", errorMessage : "", cat : categoryData , currentPage : page , 
            totalPages : totalPages , totalcategories : totalcategories, selectedFilter : "", searchQuery : searchQuery
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error : "Internal server error"})
    }
}


const addCategory = async (req,res)=>{
    try {
        const {addName , addDescription} = req.body;

        // console.log(req.body.addStatus)

        let addStatus = req.body.addStatus === "Active" ? true:false;

        if(!addName || !addDescription){
            return res.status(400).json({error : "Category name and desctiption is required."})
        }

        const existingCategory = await Category.findOne({name : addName})
        if(existingCategory){
            return res.status(400).json({error : "Category already exists."})
        }

        const newCategory = new Category ({
            name : addName,
            description : addDescription,
            visibility : addStatus
        })

        await newCategory.save();
        return res.status(200).json({message : "Category added successfully."})

    } catch (error) {
        
        console.log('Add category error : ' , error)
        return res.status(500).json({error : "Some error occured in server"})
    }
}

const editCategory = async (req,res)=>{
    try {
        const {orgName , editName , editDescription , editStatus} = req.body;
         const category = await Category.findOne({name : orgName});
         if(!category){
            return res.status(400).json({error : "Category not found"})
         }

         const existingCategory = await Category.findOne({name : editName});
         if(existingCategory && existingCategory._id.toString() !== category._id.toString()){

            return res.status(400).json({nameError : "Name already exists ."})
         }

         category.name = editName;
         category.description = editDescription;
         category.visibility = editStatus?.toLowerCase() === "active" ? true : false ;

         await category.save();

         return res.status(200).json({message : "Category added successfully ."})
    } catch (error) {
        console.log("Add Category error : ",error);
        return res.status(500).json({error : "Some error occured in the server ."})
    }
};


const filterCategories  = async (req,res)=>{
    try {
        const {visibility} = req.query;
        let filter  = {};


        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        if(visibility === 'true'){
            filter.visibility = true
        }else if(visibility === 'false'){
            filter.visibility = false;
        }

        const categories = await Category.find(filter).sort({createdAt : -1}).skip(skip).limit(limit);
        const totalcategories = await Category.countDocuments(filter);
        const totalPages = Math.ceil(totalcategories/limit)

        res.render("admin/categories",{title : "Categories", errorMessage : "" , cat : categories , currentPage : page ,
            totalPages : totalPages , totalcategories : totalcategories , selectedFilter : visibility || undefined , searchQuery : ""
        })
    } catch (error) {
        console.log("filter error :",  error)
        return res.status(500).json({error : "Some error occured on server"})
    }
}


export default {
    categoryInfo,
    addCategory,
    editCategory,
    filterCategories
}