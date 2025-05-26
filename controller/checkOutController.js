import User from '../model/userModel.js'
import Cart from '../model/cartModel.js'
import Address from '../model/addressModel.js'
import Order from '../model/orderModel.js'
import Coupon from  '../model/couponModel.js'
import Product from '../model/productModel.js'
import { customAlphabet } from 'nanoid';
import dotenv from 'dotenv';
dotenv.config();
const { RAZORPAY_ID, RAZORPAY_SECRET } = process.env;
import Razorpay from 'razorpay'
import crypto from 'crypto'



const loadCheckOut = async (req,res)=>{
    try {
        
    const {cartId,userId} = req.query;
    

    const user = await User.findOne({_id:userId})
    const address = await Address.find({userId})
    const cart = await Cart.findOne({userId}).populate('items.productId')
    
   

    let cartTotal = 0;
    let deliveryCharge = 0;
    let grandTotal = 0;

    if(cart && cart.items.length > 0){
        cartTotal = cart.items.reduce((acc,item)=> acc + item.quantity * item.price ,0)
        deliveryCharge = cartTotal < 599 ? 40 : 0;
        grandTotal = cartTotal + deliveryCharge;
    }

    const currentDate = Date.now();

    const coupons = await Coupon.find({
        status : 'Active',
        startDate : {$lte : currentDate},
        expiryDate : {$gte : currentDate},
        minPrice : {$lte : grandTotal}
    });
   

    res.render('user/checkout' , { coupons , user , address , cart , calculatedValues : { cartTotal , deliveryCharge , grandTotal }})


    } catch (error) {
        console.log(error)
    }
}


//     try {
//         const {cartId,userId,addressId,addressDetailIndex,paymentMethod,couponId } = req.body;


//         const user = await User.findOne({_id:userId})
//         if(!user){
//             return res.status(400).json({error : "User not found."})
//         }
//         const cart = await Cart.findOne({userId});
//         if(!cart){
//             return res.status(400).json({error : "User cart not found."})
//         }
//         const address = await Address.findOne({_id : addressId})
//         if(!address){
//             return res.status(400).json({error : "User address not found"})
//         }
//         const selectedAddress = address.details[addressDetailIndex]
//         if(!selectedAddress){
//             return res.status(400).json({error : "Selected address not found"})
//         }

//         const coupon = await Coupon.findOne({ _id: couponId });
       

//         // Validate coupon existence
//         if (!coupon) {
//             return res.status(400).json({error: "Coupon not found"});
//         }

//         // Check if coupon is active
//         if (coupon.status !== 'Active') {
//             return res.status(400).json({error: "Coupon is not active"});
//         }

//         // Check if coupon has expired
//         const currentDate = new Date();
//         if (currentDate > coupon.expiryDate) {
//            return res.status(400).json({error: "Coupon has expired"});
//         }

//         // Check if coupon has started
//         if (currentDate < coupon.startDate) {
//             return res.status(400).json({error: "Coupon is not yet valid"});
//         }

//         // Calculate total amount
//         let totalAmount = 0;
//         for (let item of cart.items) {
//             totalAmount += (item.price * item.quantity);
//         }

//         // Check minimum price requirement
//         if (totalAmount < coupon.minPrice) {
//             return res.status(400).json({error: `Minimum order amount of ₹${coupon.minPrice} required to use this coupon`});
//         }

//         // Handle single-use coupon validation
//         if (coupon.usageType === 'single-use') {
//             // Check if user has already used this coupon
//             const hasUserUsedCoupon = coupon.usersUsed.some(usedUserId => 
//                usedUserId.toString() === userId.toString()
//             );
            
//             if (hasUserUsedCoupon) {
//                 return res.status(400).json({error: "You have already used this coupon"});
//             }
//         }

        
//         const discountAmount = Math.min(coupon.offerPrice, totalAmount);
//         const finalAmount = totalAmount - discountAmount;

//         if (coupon.usageType === 'single-use') {
//             await Coupon.findByIdAndUpdate(couponId, {
//                 $push: { usersUsed: userId },
//                 $inc: { used: 1 }
//             });
//         } else {
//             await Coupon.findByIdAndUpdate(couponId, {
//                 $inc : {used : 1}
//             })
//         }

//         for (let item of cart.items){
//              await Product.findOneAndUpdate({_id : item.productId},
//                 {$inc : {stock : -item.quantity}}
//             )
//         }


//         const generateOrderId = () => {
          
//             const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
//             return `ORD-${nanoid()}`;
//           };

//           let deliveryCharge = 0;
//           if(totalAmount > 500){
//             deliveryCharge = 50;
//           }
          

//     const orderId = await generateOrderId()

//     const newOrder = new Order ({
//         orderId,
//         userId,
//         orderItems : cart.items.map(item=>{
//             return {
//                 productId : item.productId,
//                 quantity : item.quantity,
//                 price : item.price
//             }
//         }),
//         deliveryCharge,
//         totalAmount,
//         finalAmount : finalAmount,
//         discount : discountAmount ,
//         shippingAddress : selectedAddress,
//         invoiceDate: Date.now(),
//         paymentStatus : paymentMethod === "COD" ? "Pending" : "Paid",
//         paymentMethod

//     });

//     await newOrder.save();

//     cart.items = [];
//     await cart.save();


//     res.status(201).json({
        
//         message: "Order placed successfully",
//         orderId : orderId,
//         success : true
//     });

//     } catch (error) {
//         console.log("placeOrder error => "+error)
//         res.status(500).json({error : "Internal server error."})
//     }
// }


// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: RAZORPAY_ID,
    key_secret: RAZORPAY_SECRET
});

const placeOrder = async (req, res) => {
    try {
        const { cartId, userId, addressId, addressDetailIndex, paymentMethod, couponId } = req.body;

        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(400).json({ error: "User not found." })
        }
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(400).json({ error: "User cart not found." })
        }
        const address = await Address.findOne({ _id: addressId })
        if (!address) {
            return res.status(400).json({ error: "User address not found" })
        }
        const selectedAddress = address.details[addressDetailIndex]
        if (!selectedAddress) {
            return res.status(400).json({ error: "Selected address not found" })
        }

        // Coupon validation (only if couponId is provided)
        let coupon = null;
        let discountAmount = 0;
        
        if (couponId) {
            coupon = await Coupon.findOne({ _id: couponId });

            // Validate coupon existence
            if (!coupon) {
                return res.status(400).json({ error: "Coupon not found" });
            }

            // Check if coupon is active
            if (coupon.status !== 'Active') {
                return res.status(400).json({ error: "Coupon is not active" });
            }

            // Check if coupon has expired
            const currentDate = new Date();
            if (currentDate > coupon.expiryDate) {
                return res.status(400).json({ error: "Coupon has expired" });
            }

            // Check if coupon has started
            if (currentDate < coupon.startDate) {
                return res.status(400).json({ error: "Coupon is not yet valid" });
            }

            // Calculate total amount for coupon validation
            let totalAmount = 0;
            for (let item of cart.items) {
                totalAmount += (item.price * item.quantity);
            }

            // Check minimum price requirement
            if (totalAmount < coupon.minPrice) {
                return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minPrice} required to use this coupon` });
            }

            // Handle single-use coupon validation
            if (coupon.usageType === 'single-use') {
                // Check if user has already used this coupon
                const hasUserUsedCoupon = coupon.usersUsed.some(usedUserId =>
                    usedUserId.toString() === userId.toString()
                );

                if (hasUserUsedCoupon) {
                    return res.status(400).json({ error: "You have already used this coupon" });
                }
            }

            discountAmount = Math.min(coupon.offerPrice, totalAmount);
        }

        // Calculate total amount
        let totalAmount = 0;
        for (let item of cart.items) {
            totalAmount += (item.price * item.quantity);
        }

        let deliveryCharge = 0;
        if (totalAmount < 1000) {
            deliveryCharge = 50;
        }

        const finalAmount = totalAmount - discountAmount + deliveryCharge;

        const generateOrderId = () => {
            const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
            return `ORD-${nanoid()}`;
        };

        const orderId = generateOrderId();

        // If payment method is Razorpay, create Razorpay order
        if (paymentMethod === "RAZORPAY") {
            try {
                const razorpayOrder = await razorpay.orders.create({
                    amount: Math.round(finalAmount * 100), // Amount in paise
                    currency: 'INR',
                    receipt: orderId,
                    notes: {
                        userId: userId,
                        orderId: orderId
                    }
                });

                // Create order in pending state for Razorpay
                const newOrder = new Order({
                    orderId,
                    userId,
                    orderItems: cart.items.map(item => {
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }
                    }),
                    deliveryCharge,
                    totalAmount,
                    finalAmount: finalAmount,
                    discount: discountAmount,
                    shippingAddress: selectedAddress,
                    invoiceDate: Date.now(),
                    paymentStatus: "Paid",
                    paymentMethod,
                    razorpayOrderId: razorpayOrder.id
                });

                await newOrder.save();

                // Return Razorpay order details to frontend
                return res.status(201).json({
                    success: true,
                    razorpayOrder: {
                        id: razorpayOrder.id,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency,
                        key: RAZORPAY_ID
                    },
                    orderId: orderId,
                    userDetails: {
                        name: user.name,
                        email: user.email,
                        contact: user.phoneNumber
                    }
                });

            } catch (razorpayError) {
                console.log("Razorpay order creation error:", razorpayError);
                return res.status(500).json({ error: "Failed to create payment order" });
            }
        }

        // For COD orders, process normally
        if (coupon) {
            if (coupon.usageType === 'single-use') {
                await Coupon.findByIdAndUpdate(couponId, {
                    $push: { usersUsed: userId },
                    $inc: { used: 1 }
                });
            } else {
                await Coupon.findByIdAndUpdate(couponId, {
                    $inc: { used: 1 }
                })
            }
        }

        // Update product stock
        for (let item of cart.items) {
            await Product.findOneAndUpdate({ _id: item.productId },
                { $inc: { stock: -item.quantity } }
            )
        }

        const newOrder = new Order({
            orderId,
            userId,
            orderItems: cart.items.map(item => {
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }
            }),
            deliveryCharge,
            totalAmount,
            finalAmount: finalAmount,
            discount: discountAmount,
            shippingAddress: selectedAddress,
            invoiceDate: Date.now(),
            paymentStatus: "Pending", // COD is pending until delivery
            paymentMethod
        });

        await newOrder.save();

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            message: "Order placed successfully",
            orderId: orderId,
            success: true
        });

    } catch (error) {
        console.log("placeOrder error => " + error)
        res.status(500).json({ error: "Internal server error." })
    }
}


const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        // Create signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Verify signature
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Find the order and update payment status
            const order = await Order.findOne({ orderId: orderId });
            
            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }

            // Update order with payment details
            order.paymentStatus = "Paid";
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            await order.save();

            // Update coupon usage if coupon was applied
            if (order.couponId) {
                const coupon = await Coupon.findById(order.couponId);
                if (coupon) {
                    if (coupon.usageType === 'single-use') {
                        await Coupon.findByIdAndUpdate(order.couponId, {
                            $push: { usersUsed: order.userId },
                            $inc: { used: 1 }
                        });
                    } else {
                        await Coupon.findByIdAndUpdate(order.couponId, {
                            $inc: { used: 1 }
                        });
                    }
                }
            }

            // Update product stock
            for (let item of order.orderItems) {
                await Product.findOneAndUpdate(
                    { _id: item.productId },
                    { $inc: { stock: -item.quantity } }
                );
            }

            // Clear user's cart
            await Cart.findOneAndUpdate(
                { userId: order.userId },
                { $set: { items: [] } }
            );

            res.json({
                success: true,
                message: "Payment verified successfully",
                orderId: orderId
            });

        } else {
            // Payment verification failed
            await Order.findOneAndUpdate(
                { orderId: orderId },
                { paymentStatus: "Failed" }
            );

            res.status(400).json({
                success: false,
                error: "Payment verification failed"
            });
        }

    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error during payment verification"
        });
    }
};

const orderSuccess = async (req,res)=>{
    try {
        const orderId = req.query;
        const user =  req.session.user || req.user 
        res.render('user/orderSuccess',{
            orderId : orderId,
            user : user
        })
    } catch (error) {
        console.log("loading successPage error=> " + error)
    }
}

const failureUpdate = async (req, res) => {
  try {
    const { orderId, error } = req.body;
    // Update order status to 'Payment Failed'
    await Order.findByIdAndUpdate(orderId, { 
      paymentStatus: 'Failed',
      paymentError: error,
      orderStatus: 'Payment Failed'
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

const failurePage = async (req, res) => {
  const { orderId } = req.query;
  const userId = req.session.user._id || req.user._id
  const cart = await Cart.findOne({userId : userId})
  const cartId = cart._id;
  res.render('user/paymentFailed', { cartId,userId });
}

export default {
    loadCheckOut,
    placeOrder,
    orderSuccess,
    verifyPayment,
    failureUpdate,
    failurePage
}