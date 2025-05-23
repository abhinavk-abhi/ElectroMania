import Order from '../../model/orderModel.js'
import User from '../../model/userModel.js'
import Product from '../../model/productModel.js'
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// Main sales report page
const getSalesReport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Orders per page
        const skip = (page - 1) * limit;
        
        const filter = req.query.filter || 'all';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        
        // Build date filter
        const dateFilter = buildDateFilter(filter, startDate, endDate);
        
        // Get orders with pagination
        const orders = await Order.find(dateFilter)
            .populate('userId', 'name email')
            .populate('orderItems.productId', 'name')
            .sort({ invoiceDate: -1 })
            .skip(skip)
            .limit(limit);
            
        // Get total count for pagination
        const totalOrders = await Order.countDocuments(dateFilter);
        const totalPages = Math.ceil(totalOrders / limit);
        
        // Calculate statistics
        const stats = await calculateStatistics(dateFilter);
        
        res.render('admin/salesReport', {
            orders,
            currentPage: page,
            totalPages,
            totalOrders: stats.totalOrders,
            totalAmount: stats.totalAmount,
            totalDiscount: stats.totalDiscount,
            netSales: stats.netSales,
            filter,
            startDate,
            endDate
        });
        
    } catch (error) {
        console.error('Sales report error:', error);
        res.status(500).render('admin/error', { 
            message: 'Error loading sales report' 
        });
    }
};

// Build date filter based on selected period
const buildDateFilter = (filter, startDate, endDate) => {
    const now = new Date();
    let dateFilter = {};
    
    switch (filter) {
        case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);
            dateFilter.invoiceDate = {
                $gte: todayStart,
                $lt: todayEnd
            };
            break;
            
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            dateFilter.invoiceDate = {
                $gte: weekStart,
                $lt: weekEnd
            };
            break;
            
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            dateFilter.invoiceDate = {
                $gte: monthStart,
                $lt: monthEnd
            };
            break;
            
        case 'year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
            dateFilter.invoiceDate = {
                $gte: yearStart,
                $lt: yearEnd
            };
            break;
            
        case 'custom':
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // End of day
                dateFilter.invoiceDate = {
                    $gte: start,
                    $lte: end
                };
            }
            break;
            
        default: // 'all'
            // No date filter
            break;
    }
    
    return dateFilter;
};

// Calculate statistics for the filtered period
const calculateStatistics = async (dateFilter) => {
    try {
        const pipeline = [
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    totalDiscount: { $sum: '$discount' },
                    netSales: { $sum: '$finalAmount' }
                }
            }
        ];
        
        const result = await Order.aggregate(pipeline);
        
        if (result.length > 0) {
            return {
                totalOrders: result[0].totalOrders,
                totalAmount: result[0].totalAmount,
                totalDiscount: result[0].totalDiscount,
                netSales: result[0].netSales
            };
        }
        
        return {
            totalOrders: 0,
            totalAmount: 0,
            totalDiscount: 0,
            netSales: 0
        };
        
    } catch (error) {
        console.error('Statistics calculation error:', error);
        return {
            totalOrders: 0,
            totalAmount: 0,
            totalDiscount: 0,
            netSales: 0
        };
    }
};

// Export to PDF
const exportToPDF = async (req, res) => {
    try {
        const filter = req.query.filter || 'all';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        
        const dateFilter = buildDateFilter(filter, startDate, endDate);
        
        // Get all orders for export (no pagination)
        const orders = await Order.find(dateFilter)
            .populate('userId', 'name email')
            .populate('orderItems.productId', 'name')
            .sort({ invoiceDate: -1 });
            
        const stats = await calculateStatistics(dateFilter);
        
        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // PDF Header
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();
        
        // Period info
        const periodText = getPeriodText(filter, startDate, endDate);
        doc.fontSize(12).text(`Period: ${periodText}`, { align: 'center' });
        doc.moveDown(2);
        
        // Statistics
        doc.fontSize(14).text('Summary Statistics', { underline: true });
        doc.moveDown();
        doc.fontSize(12)
           .text(`Total Orders: ${stats.totalOrders}`)
           .text(`Total Amount: ₹${stats.totalAmount.toLocaleString('en-IN')}`)
           .text(`Total Discounts: ₹${stats.totalDiscount.toLocaleString('en-IN')}`)
           .text(`Net Sales: ₹${stats.netSales.toLocaleString('en-IN')}`);
        
        doc.moveDown(2);
        
        // Orders table header
        doc.fontSize(14).text('Order Details', { underline: true });
        doc.moveDown();
        
        // Table headers
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Order ID', 50, tableTop);
        doc.text('Customer', 120, tableTop);
        doc.text('Date', 200, tableTop);
        doc.text('Amount', 260, tableTop);
        doc.text('Discount', 320, tableTop);
        doc.text('Payment', 380, tableTop);
        
        // Draw line under headers
        doc.moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();
        
        let yPosition = tableTop + 25;
        
        // Add orders to PDF
        orders.forEach((order, index) => {
            if (yPosition > 700) { // New page if needed
                doc.addPage();
                yPosition = 50;
            }
            
            const customerName = order.userId ? order.userId.name : 'N/A';
            const orderDate = new Date(order.invoiceDate).toLocaleDateString('en-GB');
            const products = order.orderItems.map(item => 
                item.productId ? item.productId.name : 'Product'
            ).join(', ');
            
            doc.text(`#${order.orderId}`, 50, yPosition);
            doc.text(customerName, 120, yPosition);
            doc.text(orderDate, 200, yPosition);
            doc.text(`₹${order.totalAmount.toLocaleString('en-IN')}`, 260, yPosition);
            doc.text(`₹${order.discount.toLocaleString('en-IN')}`, 320, yPosition);
            doc.text(order.paymentMethod, 380, yPosition);
            
            yPosition += 20;
        });
        
        doc.end();
        
    } catch (error) {
        console.error('PDF export error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

// Export to Excel
const exportToExcel = async (req, res) => {
    try {
        const filter = req.query.filter || 'all';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        
        const dateFilter = buildDateFilter(filter, startDate, endDate);
        
        // Get all orders for export
        const orders = await Order.find(dateFilter)
            .populate('userId', 'name email')
            .populate('orderItems.productId', 'name')
            .sort({ invoiceDate: -1 });
            
        const stats = await calculateStatistics(dateFilter);
        
        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');
        
        // Add title
        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').value = 'Sales Report';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        
        // Add period
        worksheet.mergeCells('A2:G2');
        const periodText = getPeriodText(filter, startDate, endDate);
        worksheet.getCell('A2').value = `Period: ${periodText}`;
        worksheet.getCell('A2').alignment = { horizontal: 'center' };
        
        // Add statistics
        worksheet.getCell('A4').value = 'Summary Statistics';
        worksheet.getCell('A4').font = { bold: true };
        
        worksheet.getCell('A5').value = 'Total Orders:';
        worksheet.getCell('B5').value = stats.totalOrders;
        
        worksheet.getCell('A6').value = 'Total Amount:';
        worksheet.getCell('B6').value = `₹${stats.totalAmount.toLocaleString('en-IN')}`;
        
        worksheet.getCell('A7').value = 'Total Discounts:';
        worksheet.getCell('B7').value = `₹${stats.totalDiscount.toLocaleString('en-IN')}`;
        
        worksheet.getCell('A8').value = 'Net Sales:';
        worksheet.getCell('B8').value = `₹${stats.netSales.toLocaleString('en-IN')}`;
        
        // Add headers
        const headerRow = worksheet.getRow(10);
        headerRow.values = ['Order ID', 'Customer', 'Order Date', 'Products', 'Total Amount', 'Discount', 'Payment Method'];
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '2d5a27' }
        };
        headerRow.font = { color: { argb: 'FFFFFF' }, bold: true };
        
        // Add data
        orders.forEach((order, index) => {
            const row = worksheet.getRow(11 + index);
            const customerName = order.userId ? order.userId.name : 'N/A';
            const orderDate = new Date(order.invoiceDate).toLocaleDateString('en-GB');
            const products = order.orderItems.map(item => 
                item.productId ? item.productId.name : 'Product'
            ).join(', ');
            
            row.values = [
                `#${order.orderId}`,
                customerName,
                orderDate,
                products,
                `₹${order.totalAmount.toLocaleString('en-IN')}`,
                `₹${order.discount.toLocaleString('en-IN')}`,
                order.paymentMethod
            ];
        });
        
        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = 15;
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
        
        // Write to response
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Excel export error:', error);
        res.status(500).json({ error: 'Failed to generate Excel file' });
    }
};

// Helper method to get period text for exports
const getPeriodText = (filter, startDate, endDate) => {
    switch (filter) {
        case 'today':
            return 'Today';
        case 'week':
            return 'This Week';
        case 'month':
            return 'This Month';
        case 'year':
            return 'This Year';
        case 'custom':
            if (startDate && endDate) {
                return `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}`;
            }
            return 'Custom Period';
        default:
            return 'All Time';
    }
};

export default {
    getSalesReport,
    buildDateFilter,
    calculateStatistics,
    exportToPDF,
    exportToExcel,
    getPeriodText
};