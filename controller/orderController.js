import Order from '../model/orderModel.js'
import User from '../model/userModel.js'
import Address from '../model/addressModel.js'
import Product from '../model/productModel.js'
import PDFDocument from 'pdfkit'
import moment from 'moment/moment.js'

const loadOrders = async (req,res)=>{
    try {
        
        const userId = req.session.user._id || req.user._id

        if(!userId){
            return res.status(400).json({ error : "User details is not available."})
        }
        const orders = await Order.find({userId : userId}).sort({createdAt : -1 }).populate("orderItems.productId")
        res.render('user/userOrder',{
            orders : orders,    
        })

    } catch (error) {
        console.log("load orders error=> "+ error)

    }
}

const orderDetail = async (req,res)=>{
    try {
        const orderId = req.params.orderId;
       
        const order = await Order.findOne({_id : orderId}).populate("orderItems.productId")
      
        res.render('user/orderDetail',{order : order})
    } catch (error) {
        
    }
}

const cancelItem = async (req,res)=>{
    try {
        
        const user =  req.session.user || req.user;
        const userId = user._id
        const { orderId , itemId , reason } = req.body;

        const order = await Order.findOne({_id : orderId}).populate("orderItems.productId")

        if(!order) {
            return res.status(404).send("Order not found.")
        }

        const item = order.orderItems.find(i=> i._id.toString() == itemId);

        if(!item){
            return res.status(404).send("Product not found in the order")
        }

        const reStock = item.quantity;
        const itemTotal = item.quantity * item.price;

        const totalOrderPrice = order.totalAmount;
        const totalDiscound = order.discount;

        const itemDiscoundShare = totalOrderPrice === 0 ? 0 : (itemTotal / totalOrderPrice) * totalDiscound;
        const refundAmount = Math.round(itemTotal - itemDiscoundShare)

      

       if(order.paymentMethod === "RAZORPAY" && order.paymentStatus === "Paid"){
    await User.findOneAndUpdate(
        {_id : userId},
        {
            $inc : { wallet : refundAmount },
            $push : { 
                walletHistory : {
                    amount : refundAmount,
                    type : 'refund',
                    orderId : orderId,
                   
                }
            }
        },
        { new : true }
    )
} else if(order.paymentMethod === "WALLET" && order.paymentStatus === "Paid"){
    await User.findOneAndUpdate(
        {_id : userId},
        {
            $inc : { wallet : refundAmount },
            $push : { 
                walletHistory : {
                    amount : refundAmount,
                    type : 'refund',
                    orderId : orderId,
                   
                }
            }
        },
        { new : true }
    )
}

       

        await Product.findOneAndUpdate(
            {_id : item.productId},
            { $inc : { stock : reStock} }
        );

        item.quantity = 0;
        item.price = 0;
        item.deliveryStatus = "Cancelled"
        item.cancelled = true;
        item.cancelReason = reason;
        item.cancelledAt = new Date();
        let newTotalPrice = 0;
        for( const i of order.orderItems){
            newTotalPrice += (i.quantity * i.price)
        }

        order.totalAmount = newTotalPrice;
        order.discount = order.discount - itemDiscoundShare;
        order.finalAmount = Math.round(newTotalPrice - order.discount)
        
        await order.save()


        // ---- If all items cancelled, cancel the whole order ---- //
        const allCancelled = order.orderItems.every(i => i.cancelled);
        if (allCancelled) {
            order.orderStatus = 'Cancelled';
            await order.save();
        }

        return res.status(200).json({ message: "Item cancelled successfully" });

    } catch (error) {
        console.log("cancelItem --->"+error)
    }
}


const returnOrder = async (req,res)=>{

    try {
        
        const { orderId , itemId , returnReason } = req.body;

        const order = await Order.findOne({ _id : orderId }).populate("orderItems.productId")

        if(!order){
            console.log("Order details for return is not found, orderId :" , orderId)
            return res.status(404).json({ message : "Something Went wrong with order" })
        }

        const productToBeReturned = order.orderItems.find(item=>
            item._id.toString() === itemId.toString()
        )

        if(!productToBeReturned){
            console.log("failed to find product inside the order, ProductId:", productId);
            return res.status(404).json({ message: "Failed to fetch the product Details" });
        }

        productToBeReturned.returnReason = returnReason;
        productToBeReturned.returnStatus = 'Pending';

        await order.save();
        return res.status(200).json({ message: "Return requested" });

    } catch (error) {
        console.error("failed to send return request", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const cancelReturn = async (req,res)=>{
    try {
        
        const { orderId , itemId } =  req.body;

        const order = await Order.findOne({_id : orderId}).populate("orderItems.productId");

        if(!order) {
            return res.status(404).json({ message : "Order is not found ."})
        }

        const product = order.orderItems.find(item=>
            item._id.toString() === itemId.toString()
        )

        if(!product){
            return res.status(404).json({ message : "Failed to get product details"})
        }

        product.returnStatus = "None";

        await order.save()
        return res.status(200).json({ message : "Return request cancelled Successfully"})

    } catch (error) {
        console.log("Return cancel error => " , error);
        return res.status(500).json({ message : "Internal server error."})
    }
}

const invoice = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate({
                path: 'orderItems.productId'
            })
   

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Get the shipping address from the populated address field
        let shippingAddress = order.shippingAddress;


        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            bufferPages: true // Enable page buffering for adding page numbers
        });

        // Set the response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);
        doc.pipe(res);

        // Define colors and styles
        const primaryColor = '#333333';
        const secondaryColor = '#555555';
        const accentColor = '#4A90E2';
        const lightGray = '#EEEEEE';

        // Add document title and logo (top section)
        doc.rect(50, 50, 500, 80)
           .fillAndStroke('#F9F9F9', '#E0E0E0');
        
        // Add Logo if needed
        // doc.image('path/to/your/logo.png', 60, 60, { width: 80 });
        
        // Add title
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text('ElectroMania', 160, 65);
           
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor(secondaryColor)
           .text('Your Electronics Store', 160, 95);
           
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor(accentColor)
           .text('INVOICE', 430, 75);

        // Add invoice information section
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor(primaryColor)
           .text('Invoice Date:', 50, 150)
           .text('Order ID:', 50, 165)
           .text('Customer:', 50, 180)
           .text('Email:', 50, 195);
        
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(secondaryColor)
           .text(moment(order.createdAt).format('ddd MMM DD YYYY'), 150, 150)
           .text(order.orderId, 150, 165)
           .text(order.userId.name, 150, 180)
           .text(order.userId.email, 150, 195);

        // Add shipping address section
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text('Shipping Address:', 300, 150);
        
        const addressText = [
            shippingAddress.name || order.userId.name,
            shippingAddress.street || shippingAddress.addressLine1,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.zipCode,
            shippingAddress.country || 'India'
        ].filter(Boolean).join(', ');
        
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(secondaryColor)
           .text(addressText, 300, 165, { width: 250, align: 'left' });
        
        if (shippingAddress.phone) {
            doc.text(`Phone: ${shippingAddress.phone}`, 300, doc.y + 5);
        }

        // Add horizontal line
        doc.strokeColor('#CCCCCC')
           .lineWidth(1)
           .moveTo(50, 230)
           .lineTo(550, 230)
           .stroke();

        // Add table headers
        const tableTop = 250;
        const tableHeaders = ['Item', 'Status' , 'Price', 'Quantity', 'Amount'];
        const tableColumnWidths = [250, 27, 100, 60, 90];
        
        // Draw the table header background
        doc.rect(50, tableTop - 10, 500, 20)
           .fill('#F6F6F6');
        
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor(primaryColor);
        
        let xPosition = 50;
        tableHeaders.forEach((header, i) => {
            const width = tableColumnWidths[i];
            const align = i === 0 ? 'left' : 'right';
            doc.text(header, xPosition, tableTop, { width, align });
            xPosition += width;
        });

        // Draw items in the table
        let yPosition = tableTop + 20;
        
        // Add table rows
        order.orderItems.forEach((item, index) => {
            // Alternate row background for better readability
            if (index % 2 === 0) {
                doc.rect(50, yPosition - 5, 500, 25)
                   .fill('#FBFBFB');
            }

            const product = item.productId || {};
            const productName = product.name || item.name || 'Unknown Product';
            const price = Math.round(product.price - (product.price * product.productOffer / 100))|| 0; 
            const quantity = item.quantity || 0;
            const amount = price * quantity;
            const deliveryStatus = item.deliveryStatus;
            
            doc.font('Helvetica')
               .fontSize(9)
               .fillColor(secondaryColor);
               
            // Item name
            doc.text(productName, 50, yPosition, { width: 250 });

            // Delivery status
            doc.text(deliveryStatus , 280 , yPosition , {width : 170 })
            
            // Price
            doc.text(`₹${price.toLocaleString('en-IN')}`, 300, yPosition, { width: 100, align: 'right' });
            
            // Quantity
            doc.text(quantity.toString(), 400, yPosition, { width: 60, align: 'right' });
            
            // Amount
            doc.text(`₹${amount.toLocaleString('en-IN')}`, 460, yPosition, { width: 90, align: 'right' });
            
            yPosition += 25;
        });

        // Draw a line at the end of the items table
        doc.strokeColor('#CCCCCC')
           .lineWidth(1)
           .moveTo(50, yPosition)
           .lineTo(550, yPosition)
           .stroke();
        
        // Calculate totals
        const subtotal = order.finalAmount || 0     ;
        // const discount = order.coupon || 0;
        const deliveryCharge = order.deliveryCharge || 0;
        const finalAmount = order.finalAmount + deliveryCharge;

        // Add summary section
        const summaryStartY = yPosition + 20;
        
        // Draw summary box
        doc.rect(350, summaryStartY, 200, 100)
           .fillAndStroke('#F9F9F9', '#E0E0E0');
        
        // Add summary details
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor(primaryColor)
           .text('Order Summary', 360, summaryStartY + 10, { width: 180, align: 'center' });
           
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(secondaryColor);
           
        // Subtotal row
        doc.text('Subtotal:', 370, summaryStartY + 30);
        doc.text(`₹${subtotal.toLocaleString('en-IN')}`, 480, summaryStartY + 30, { align: 'right' });
        
        // // Discount row
        // doc.text('Discount:', 370, summaryStartY + 45);
        // doc.text(`₹${discount.toLocaleString('en-IN')}`, 480, summaryStartY + 45, { align: 'right' });
        
        // Delivery charge row
        doc.text('Delivery Charge:', 370, summaryStartY + 60);
        doc.text(`₹${deliveryCharge.toLocaleString('en-IN')}`, 480, summaryStartY + 60, { align: 'right' });
        
        // Total row
        doc.rect(350, summaryStartY + 75, 200, 25)
           .fillAndStroke('#4A90E2', '#3A80D2');
           
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fillColor('white')
           .text('Total Amount:', 370, summaryStartY + 82);
        doc.text(`₹${finalAmount.toLocaleString('en-IN')}`, 480, summaryStartY + 82, { align: 'right' });

        // Add payment information
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .fillColor(primaryColor)
           .text('Payment Information', 50, summaryStartY);
           
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(secondaryColor);
           
        doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 50, summaryStartY + 20);
        doc.text(`Payment Status: ${order.paymentStatus}`, 50, summaryStartY + 35);
        // doc.text(`Order Status: ${order.orderItems.deliveryStatus}`, 50, summaryStartY + 50);

        // Add footer
        const footerY = 700;
        
        // Footer separator line
        doc.strokeColor('#CCCCCC')
           .lineWidth(1)
           .moveTo(50, footerY)
           .lineTo(550, footerY)
           .stroke();
           
        // Footer text
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(secondaryColor)
           .text('Thank you for shopping with ElectroMania!', 50, footerY + 15, { align: 'center' });
           
        doc.fontSize(8)
           .fillColor('#888888')
           .text('This is a computer generated invoice and does not require a signature.', 50, footerY + 30, { align: 'center' });
           
        // Add contact information
        doc.fontSize(8)
           .text('For any queries, please contact: support@electromania.com | +91 9876543210', 50, footerY + 45, { align: 'center' });

        // Count pages and add page numbers at the end
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8)
               .fillColor('#888888')
               .text(
                   `Page ${i + 1} of ${pages.count}`,
                   50,
                   doc.page.height - 50,
                   { align: 'center' }
               );
        }

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({
            message: "Failed to create invoice",
            error: error.message
        });
    }
};


export default {
    loadOrders,
    orderDetail,
    cancelItem,
    returnOrder,
    cancelReturn,
    invoice
}