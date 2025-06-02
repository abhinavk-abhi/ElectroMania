import User from '../../model/userModel.js'

const loadWalletManagement = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const filterType = req.query.filterType || '';
        const dateFrom = req.query.dateFrom || '';
        const dateTo = req.query.dateTo || '';

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Get users with wallet data
        const users = await User.find(searchQuery)
            .select('name email wallet walletHistory')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments(searchQuery);

        // Get wallet statistics
        const stats = await getWalletStats(filterType, dateFrom, dateTo);

        // Get all wallet transactions for admin view
        const allTransactions = await getAllWalletTransactions(filterType, dateFrom, dateTo, search);

        res.render('admin/walletReport', {
            req:req,
            users,
            allTransactions,
            stats,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            search,
            filterType,
            dateFrom,
            dateTo,
            limit
        });

    } catch (error) {
        console.log('Error loading wallet management:', error);
        res.status(500).render('404', { error: 'Failed to load wallet management' });
    }
}

// Get wallet statistics
const getWalletStats = async (filterType = '', dateFrom = '', dateTo = '') => {
    try {
        // Build date filter
        let dateFilter = {};
        if (dateFrom && dateTo) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(dateFrom),
                    $lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999))
                }
            };
        }

        // Get all users with wallet data
        const users = await User.find(dateFilter).select('wallet walletHistory');

        let totalWalletBalance = 0;
        let totalTransactions = 0;
        let totalRefunds = 0;
        let totalTopUps = 0;
        let totalPurchases = 0;
        let totalReferralRewards = 0;
        let totalCreditAmount = 0;
        let totalDebitAmount = 0;

        users.forEach(user => {
            totalWalletBalance += user.wallet || 0;
            
            if (user.walletHistory && user.walletHistory.length > 0) {
                user.walletHistory.forEach(transaction => {
                    // Apply date filter to transactions if specified
                    if (dateFrom && dateTo) {
                        const transactionDate = new Date(transaction.date);
                        if (transactionDate < new Date(dateFrom) || transactionDate > new Date(dateTo)) {
                            return;
                        }
                    }

                    // Apply type filter if specified
                    if (filterType && transaction.type !== filterType) {
                        return;
                    }

                    totalTransactions++;
                    const amount = Number(transaction.amount) || 0;

                    if (amount >= 0) {
                        totalCreditAmount += amount;
                    } else {
                        totalDebitAmount += Math.abs(amount);
                    }

                    // Count by type
                    switch (transaction.type) {
                        case 'refund':
                            totalRefunds++;
                            break;
                        case 'top-up':
                            totalTopUps++;
                            break;
                        case 'purchase':
                            totalPurchases++;
                            break;
                        case 'referral-reward':
                            totalReferralRewards++;
                            break;
                    }
                });
            }
        });

        return {
            totalWalletBalance,
            totalTransactions,
            totalRefunds,
            totalTopUps,
            totalPurchases,
            totalReferralRewards,
            totalCreditAmount,
            totalDebitAmount,
            totalUsers: users.length,
            usersWithBalance: users.filter(user => (user.wallet || 0) > 0).length
        };

    } catch (error) {
        console.log('Error getting wallet stats:', error);
        return {};
    }
}

// Get all wallet transactions for admin view
const getAllWalletTransactions = async (filterType = '', dateFrom = '', dateTo = '', search = '') => {
    try {
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(searchQuery)
            .select('name email walletHistory')
            .lean();

        let allTransactions = [];

        users.forEach(user => {
            if (user.walletHistory && user.walletHistory.length > 0) {
                user.walletHistory.forEach(transaction => {
                    // Apply date filter
                    if (dateFrom && dateTo) {
                        const transactionDate = new Date(transaction.date);
                        if (transactionDate < new Date(dateFrom) || transactionDate > new Date(dateTo)) {
                            return;
                        }
                    }

                    // Apply type filter
                    if (filterType && transaction.type !== filterType) {
                        return;
                    }

                    allTransactions.push({
                        ...transaction,
                        userName: user.name,
                        userEmail: user.email,
                        userId: user._id
                    });
                });
            }
        });

        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        return allTransactions.slice(0, 50); // Limit to 50 recent transactions for performance

    } catch (error) {
        console.log('Error getting all transactions:', error);
        return [];
    }
}

// Add money to user wallet (admin action)
const addMoneyToWallet = async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        
        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID or amount' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Add money to wallet
        user.wallet = (user.wallet || 0) + Number(amount);
        
        // Add transaction to wallet history
        user.walletHistory.push({
            amount: Number(amount),
            type: 'top-up',
            transactionId: `ADMIN_${Date.now()}`,
            date: new Date()
        });

        await user.save();

        res.json({ 
            success: true, 
            message: `₹${amount} added to ${user.name}'s wallet successfully`,
            newBalance: user.wallet
        });

    } catch (error) {
        console.log('Error adding money to wallet:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add money to wallet' 
        });
    }
}

// Deduct money from user wallet (admin action)
const deductMoneyFromWallet = async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        
        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID or amount' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if ((user.wallet || 0) < Number(amount)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient wallet balance' 
            });
        }

        // Deduct money from wallet
        user.wallet = (user.wallet || 0) - Number(amount);
        
        // Add transaction to wallet history
        user.walletHistory.push({
            amount: -Number(amount),
            type: 'purchase', // or create a new type like 'admin-deduction'
            transactionId: `ADMIN_DEDUCT_${Date.now()}`,
            date: new Date()
        });

        await user.save();

        res.json({ 
            success: true, 
            message: `₹${amount} deducted from ${user.name}'s wallet successfully`,
            newBalance: user.wallet
        });

    } catch (error) {
        console.log('Error deducting money from wallet:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to deduct money from wallet' 
        });
    }
}

export default {
    loadWalletManagement,
    addMoneyToWallet,
    deductMoneyFromWallet
}