import User from '../model/userModel.js'
import Address from '../model/addressModel.js'

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

const newAddress = async (req,res)=>{
    try {
        const {userId , name , phone , pincode , locality , address , city , state , landmark , altPhone , addressType } = req.body;
        // const userId = req.session.user?.id ?? req.session.user?._id ?? null;

        if(!userId ){
            return res.status(400).json({ error : "UserId is required"})
        }

        if(!name || !phone || !pincode || !locality || !address || !city || !state || !addressType ){
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
            address,
            city,
            landMark : landmark,
            state,
            pincode,
            phone,
            altPhone
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

export default {
    loadAddress,
    newAddress,
    loadEditAddress
}