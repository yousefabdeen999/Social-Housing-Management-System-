const cartModel = require("../Models/cart.model")
const orderModel = require("../Models/order.model")
const userModel = require("../Models/user.model")
// let checkout = async (req, res, next) => {

// const { shippingAddress, phone } = req.body
let checkout = async (req, res, next) => {
    const userId = req.user.userId
    try {
        const { phone, shippingAddress, paymentMethod } = req.body
        const cart = await cartModel.findOne({ user: userId })

        if (!cart || cart.items.length === 0) {
            const error = new Error("Cart is empty")
            error.statusCode = 204
            throw error
        }

        const order = new orderModel({
            user: userId,
            phone,
            shippingAddress,
            paymentMethod,
            totalPrice: cart.getTotalPrice(),
        })

        await order.save()

        // Empty the cart
        cart.items = []
        await cart.save()

        // Add the order to the user's order history
        const user = await userModel.findById(userId)
        user.orderHistory.push(order._id)
        await user.save()

        res.status(201).json({ message: "Order created successfully." })
    } catch (err) {
        next(err)
    }
}

let getOrders = async (req, res, next) => {
    const userId = req.user.userId

    try {
        // Find the user's orders and populate the order information
        const orders = await orderModel
            // i want to get all order that aren't cancelled

            .find({ user: userId, status: { $not: { $eq: "cancelled" } } }) // Exclude orders with status "cancelled"
            .populate("items.drug", " name  -_id")
            .select("-items._id")
            .populate("user", "userName email -_id")
            .select("-__v")

        if (!orders || orders.length === 0) {
            const error = new Error("No orders found")
            error.statusCode = 204
            throw error
        }

        res.status(200).json({
            message: "Fetched orders successfully",
            orders,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

const cancelOrder = async (req, res, next) => {
    const { orderId } = req.params

    try {
        // Find the order to delete
        const order = await orderModel.findById(orderId)

        // Check if the order status is "shipped" or "delivered"
        if (order.status === "shipped" || order.status === "delivered") {
            const error = new Error(
                "Order cannot be cancelled as it has been shipped or delivered"
            )
            error.statusCode = 400
            throw error
        }

        // Update the status in the user's order history to "cancelled"
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status: "cancelled" },
            { new: true }
        )

        res.status(200).json({
            message: "Order cancelled successfully",
            order: updatedOrder,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}
// i want to delete the order from the user's order history if the order statues cancelled

let deleteOrderHistory = async (req, res, next) => {
    const { orderId } = req.params
    const userId = req.user.userId
    try {
        const orderStats = await orderModel.findById(orderId).lean()

        if (!orderStats) {
            const error = new Error("Order not found")
            error.statusCode = 404
            throw error
        }

        if (orderStats.status === "cancelled") {
            const result = await userModel.findByIdAndUpdate(
                userId,
                { $pull: { orderHistory: orderId } },
                { new: true }
            )

            if (!result) {
                const error = new Error("User not found")
                error.statusCode = 404
                throw error
            }

            res.status(200).json({
                message: "Order deleted successfully from user history.",
            })
        } else {
            const error = new Error(
                "Order cannot be deleted as it has not been cancelled"
            )
            error.statusCode = 400
            throw error
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

module.exports = {
    checkout,
    getOrders,
    cancelOrder,
    deleteOrderHistory,
}
