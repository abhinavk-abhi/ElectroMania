import Order from '../../model/orderModel.js';
import Product from '../../model/productModel.js';
import Category from '../../model/categoryModel.js';
import User from '../../model/userModel.js';
import mongoose from 'mongoose';

const getDashboard = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        // Get date range based on period
        const dateRange = getDateRange(period);
        
        // Get dashboard statistics
        const dashboardStats = await getDashboardStats(dateRange);
        
        // Get chart data for sales
        const chartData = await getSalesChartData(period, dateRange);
        
        // Get best selling data
        const bestSellingProducts = await getBestSellingProducts();
        const bestSellingCategories = await getBestSellingCategories();
        const bestSellingBrands = await getBestSellingBrands();
        
        // Get recent orders
        const recentOrders = await getRecentOrders();
        
        res.render('admin/dashboard', {
            title: 'Dashboard',
            dashboardStats,
            chartData,
            bestSellingProducts,
            bestSellingCategories,
            bestSellingBrands,
            recentOrders,
            currentPeriod: period
        });
        
    } catch (error) {
        console.log('Dashboard error:', error);
        res.status(500).render('error', { 
            message: 'Error loading dashboard',
            error: error.message 
        });
    }
};

const getDateRange = (period) => {
    const now = new Date();
    let startDate, endDate = now;
    
    switch (period) {
        case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return { startDate, endDate };
};

const getDashboardStats = async (dateRange) => {
    const { startDate, endDate } = dateRange;
    
    try {
        // Total customers
        const totalCustomers = await User.countDocuments({ role: 'user' });
        
        // Orders in date range
        const ordersInRange = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: 'Success'
        });
        
        // Total sales amount
        const totalSales = ordersInRange.reduce((sum, order) => sum + order.finalAmount, 0);
        
        // Total orders count
        const totalOrders = ordersInRange.length;
        
        // Products sold (sum of quantities)
        const productsSold = ordersInRange.reduce((sum, order) => {
            return sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        
        return {
            totalCustomers,
            totalSales,
            totalOrders,
            productsSold
        };
    } catch (error) {
        console.log("Dashboard stats error:", error);
        return {
            totalCustomers: 0,
            totalSales: 0,
            totalOrders: 0,
            productsSold: 0
        };
    }
};

const getSalesChartData = async (period, dateRange) => {
    const { startDate, endDate } = dateRange;
    
    try {
        let groupBy;
        let dateFormat;
        
        switch (period) {
            case 'daily':
                groupBy = { $dateToString: { format: "%H", date: "$createdAt" } };
                dateFormat = 'hour';
                break;
            case 'weekly':
                groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                dateFormat = 'day';
                break;
            case 'monthly':
                groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                dateFormat = 'day';
                break;
            case 'yearly':
                groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
                dateFormat = 'month';
                break;
            default:
                groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                dateFormat = 'day';
        }
        
        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    orderStatus: 'Success'
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalSales: { $sum: "$finalAmount" },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        return {
            labels: salesData.map(item => item._id),
            sales: salesData.map(item => item.totalSales),
            orders: salesData.map(item => item.totalOrders),
            period: dateFormat
        };
    } catch (error) {
        console.log("Chart data error:", error);
        return {
            labels: [],
            sales: [],
            orders: [],
            period: 'day'
        };
    }
};

const getBestSellingProducts = async () => {
    try {
        const bestProducts = await Order.aggregate([
            { $match: { orderStatus: 'Success' } },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.productId',
                    totalQuantity: { $sum: '$orderItems.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    name: '$product.name',
                    brand: '$product.brand',
                    image: { $arrayElemAt: ['$product.images', 0] },
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);
        
        return bestProducts;
    } catch (error) {
        console.log("Best products error:", error);
        return [];
    }
};

const getBestSellingCategories = async () => {
    try {
        const bestCategories = await Order.aggregate([
            { $match: { orderStatus: 'Success' } },
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category._id',
                    name: { $first: '$category.name' },
                    totalQuantity: { $sum: '$orderItems.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);
        
        return bestCategories;
    } catch (error) {
        console.log("Best categories error:", error);
        return [];
    }
};

const getBestSellingBrands = async () => {
    try {
        const bestBrands = await Order.aggregate([
            { $match: { orderStatus: 'Success' } },
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.brand',
                    totalQuantity: { $sum: '$orderItems.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
                }
            },
            {
                $project: {
                    name: '$_id',
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);
        
        return bestBrands;
    } catch (error) {
        console.log("Best brands error:", error);
        return [];
    }
};

const getRecentOrders = async () => {
    try {
        const recentOrders = await Order.find({ orderStatus: 'Success' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);
        
        return recentOrders;
    } catch (error) {
        console.log("Recent orders error:", error);
        return [];
    }
};

const getDashboardData = async (req, res) => {
    try {
        const { type, period = 'monthly' } = req.query;
        
        const dateRange = getDateRange(period);
        
        let data = {};
        
        switch (type) {
            case 'stats':
                data = await getDashboardStats(dateRange);
                break;
            case 'chart':
                data = await getSalesChartData(period, dateRange);
                break;
            case 'products':
                data = await getBestSellingProducts();
                break;
            case 'categories':
                data = await getBestSellingCategories();
                break;
            case 'brands':
                data = await getBestSellingBrands();
                break;
            default:
                return res.status(400).json({ error: 'Invalid data type' });
        }
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.log("Dashboard data error:", error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

export default {
    getDashboard,
    getDashboardData,
    getBestSellingProducts,
    getBestSellingCategories,
    getBestSellingBrands,
    getRecentOrders
};