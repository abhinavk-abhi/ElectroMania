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
      const category = await Category.findOne({name : req.query.category});
      if(category){
        filter.category = category._id
      }else{
        filter.cateogory = null
      }
    }

    if (req.query.stock === "1") {
      filter.stock = { $gt: 0 };
    } else if (req.query.stock === "2") {
      filter.stock = { $eq: 0 };
    }

    if (req.query.status === "1") {
      filter.visibility = true;
    } else if (req.query.status === "2") {
      filter.visibility = false;
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

const loadEditProducts = async(req,res)=>{
 try {
  const id = req.params.productId;
  const product = await Product.findOne({_id:id})

  if(!product){
    return res.status(404).json({message : "Product not found"})
  }
  const categories = await Category.find({visibility : true})
 
  res.render('admin/editProducts',{
    product : product,
    category : categories
  })
 } catch (error) {
  console.log("Edit product load error :",error)
    return res.status(500)
 }
}

const editProduct = async (req,res)=>{
  try{
    const {productId, productName, productCategory, productBrand, productPrice, productOffer, description, productStock , visibility , givenId} = req.body;

    const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

    const product = await Product.findOne({_id : productId});
    

    if(!product){
      return res.status(404).json({message : "Product not found"})
    }

    for (const imageUrl of removedImages) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);

      product.images = product.images.filter(img=> img !== imageUrl);
    }

    const category = await Category.findOne({_id : productCategory})
    
    const categoryId = category._id 
   
      product.productId = givenId;
      product.name = productName;
      product.category = categoryId;
      product.description = description;
      product.brand = productBrand;
      product.price= productPrice;
      product.productOffer= productOffer;
      product.stock = productStock;
      product.visibility = visibility;
    

    if(req.files){
      const newImages = req.files.map(file => file.path);
      product.images.push(...newImages)
    }

    await product.save()
    res.status(201).json({message : "Product edited successfully"});
  }catch (error){
console.log("Edit product error :",error)
return res.status(500).json({message : "Something went wrong try again later."})
  }
}

export default {
  productLoad,
  loadAddProduct,
  addProduct ,
  loadEditProducts,
  editProduct

};
