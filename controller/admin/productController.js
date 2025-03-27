import Product from "../../model/productModel.js";
import Category from "../../model/categoryModel.js";
import cloudinary from "../../config/cloudinary.js";
import {nanoid} from "nanoid"

const productLoad = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const filter = {};

    const category = await Category.find();

    if (req.query.category && req.query.category !== "all") {
      filter.category = req.query.category;
    }

    if (req.query.stock === "1") {
      filter.stock = { $gt: 0 };
    } else if (req.query.stock === "2") {
      filter.stock = { $eq: 0 };
    }

    if (req.query.status === "1") {
      filter.isBlock = false;
    } else if (req.query.status === "2") {
      filter.isBlock = true;
    }

    if (req.query.query) {
      const searchRegex = new RegExp(req.query.query, "i");
      filter.name = searchRegex;
    }

    const products = await Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    // console.log(category)
    res.render("admin/products", {
      title: "Products",
      errorMessage: "",
      products: products,
      category: category,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts,
      selectedCategory: req.query.category || "all",
      selectedStock: req.query.stock || "all",
      selectedStatus: req.query.status || "all",
      searchQuery: req.query.query || " ",
    });
  } catch (error) {
    console.log("Product page fetch error : ", error);
    res.status(500).json({ error: "Unexpected error" });
  }
};


const loadAddProduct = async (req,res)=>{
    try {
        const categories = await Category.find({visibility : true})

        res.render('admin/addProducts',{
          category : categories
        });
    } catch (error) {
        console.error('Error loading the add product page :',error);
        res.status(500).json({message : "Internal server error. Please try again later."})
    }
}

const generateProductId = () => {
  return `EMP-${nanoid(10)}`;
};



const addProduct = async (req,res)=>{
  try {
    const {productName,productCategory,productBrand,productPrice,productOffer,productDescription,productStock,productSpec} = req.body;

    const imageUrl = req.files.map(file=>file.path);

    const category = await Category.findOne({name : productCategory})
    const categoryId = category._id;

    let productId = await generateProductId()
    const newProduct = new Product({
      productId : productId,
      name : productName,
      category : categoryId,
      description : productDescription,
      brand : productBrand,
      price: productPrice,
      productOffer: productOffer,
      stock : productStock,
      specification : productSpec,
      images : imageUrl
    })

    await newProduct.save();

    await Category.findOneAndUpdate({name : productCategory},{$inc : {itemsCount : 1}});

    res.status(201).json({message : "Product added successfully"});

  } catch (error) {
    
    console.log("Add product error :",error);
    return res.status(500).json({error: "Internal server error"})
  }
}


export default {
  productLoad,
  loadAddProduct,
  addProduct 

};
