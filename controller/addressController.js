import User from '../model/userModel.js'
import Address from '../model/addressModel.js'
import Cart from '../model/cartModel.js'

const loadAddress = async (req,res)=>{
    try {
        const userId = req.session.user?.id ?? req.session.user?._id ?? null;

        if (!userId) return res.redirect('/user/login');

        const user = await User.findOne({_id : userId})
        req.session.user  = user;

        const address = await Address.find({ userId : userId });

        
    
     
        if(address){
            res.render('user/address', {
                title: 'Manage Addresses',
                address,
                user,
                
            });
        }else{
            return res.render('user/address',{
                user : user ,
                address : null
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({error : "Internal server error."})
    }
}

const loadAddAddress = async (req,res)=>{
    try {
        return res.render("user/addAddress")
    } catch (error) {
        console.log("addAddress error" + error)
        return res.status(500).json({ message : "Error occured , Sorry...."})
    }
}

const newAddress = async (req,res)=>{
    try {
        const  { name, phone, addressLine1, addressLine2, landmark, city, state, country, altNumber, zipCode, addressType } = req.body;
        const userId = req.session.user?.id ?? req.session.user?._id ?? null;
       

        if(!userId ){
            return res.status(400).json({ error : "UserId is required"})
        }

        if(!name || !phone || !zipCode || !addressLine1 || !city || !state || !addressType ){
            return res.status(400).json({ error : "All fields are required"})
        }

        let userAddress = await Address.findOne({ userId });

        if (!userAddress) {
            userAddress = new Address({
                userId,
                details: []
            });
        }

        const newIndex = userAddress.details.length;

        userAddress.details.push({
            index: newIndex,
            addressType,
            name: name,
            addressLine1,
            addressLine2,
            city,
            landmark,
            state,
            country,
            zipCode,
            phone,
            altNumber
        });

        await userAddress.save();

        return res.status(201).json({ message: "Address added successfully" });

    } catch (error) {
        console.error("Error adding address:", error);
        return res.status(500).json({ error: error.message || "Address creation error" });
    }
}


const loadEditAddress = async (req, res) => {
    try {
        const { id, index, from } = req.query;

        const userId = req.session.user?.id ?? req.session.user?._id ?? null;
        const user = await User.findOne({_id : userId})
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

      

        const address = await Address.findOne({ 
            userId: id,
        });

        if (!address) {
            return res.status(404).json({ error: "Address not found" });
        }

        const selectedAddress = address.details[index];

        if (!selectedAddress) {
            return res.status(404).json({ error: "Address details not found" });
        }

        res.render('user/editAddress', {
            address: selectedAddress,
            user,
            addressId: id,
            index,
            from
        });
    } catch (error) {
        console.error("Error loading address:", error);
        res.status(500).json({ 
            error: "Internal Server Error",
            message: error.message 
        });
    }
};

const deleteAddress = async (req,res)=>{
    try {
        const {userId , index} = req.query;
        
        const address = await Address.findOne({userId : userId})

        address.details.splice(index,1)

        await address.save()

        return res.status(200).json({message : "Deleted successfully.!"})
        
    } catch (error) {
        console.log("address delete error" + error)
        return res.status(500).json({message : "Failed to delete address."})
    }
}

const addCheckOutAddress = async (req,res)=>{
    try {
        return res.render("user/checkOutAddress")
    } catch (error) {
        console.log("checkout address error" + error)
        return res.status(500).json({ message : "Error occured , Sorry...."})
    }
}

const saveCheckOutAddress = async (req,res)=>{
    try {
        const  { name, phone, addressLine1, addressLine2, landmark, city, state, country, altNumber, zipCode, addressType } = req.body;
        const userId = req.session.user?.id ?? req.session.user?._id ?? null;
        const cart = await Cart.findOne({userId})
        const cartId = cart._id;

        if(!userId ){
            return res.status(400).json({ error : "UserId is required"})
        }

        if(!name || !phone || !zipCode || !addressLine1 || !city || !state || !addressType ){
            return res.status(400).json({ error : "All fields are required"})
        }

        let userAddress = await Address.findOne({ userId });

        if (!userAddress) {
            userAddress = new Address({
                userId,
                details: []
            });
        }

        const newIndex = userAddress.details.length;

        userAddress.details.push({
            index: newIndex,
            addressType,
            name: name,
            addressLine1,
            addressLine2,
            city,
            landmark,
            state,
            country,
            zipCode,
            phone,
            altNumber
        });

        await userAddress.save();

        return res.status(201).json({ message: "Address added successfully" ,
            redirectUrl : `/user/checkout?cartId=${cartId}&userId=${userId}`
        });

    } catch (error) {
        console.error("Error adding address:", error);
        return res.status(500).json({ error: error.message || "Address creation error" });
    }
}

export default {
    loadAddress,
    newAddress,
    loadEditAddress,
    loadAddAddress,
    deleteAddress,
    addCheckOutAddress,
    saveCheckOutAddress

}