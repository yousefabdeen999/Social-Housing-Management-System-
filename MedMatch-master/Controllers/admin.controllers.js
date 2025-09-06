const drugModel = require("../Models/drug.model")
const userModel = require("../Models/user.model")
const orderModel = require("../Models/order.model")

let getallUsers = async (req, res, next) => {
    try {
        const users = await userModel.find()
        if (!users) {
            const error = new Error("Could not find any user")
            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            message: "Fetched users successfully.",
            users: users.map((users) => {
                return {
                    id: users._id,
                    username: users.userName,
                    email: users.email,
                    role: users.role,
                }
            }),
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let getUser = async (req, res, next) => {
    try {
        let user = await userModel.findById(req.params.userId)
        res.status(200).json({
            message: "Fetched user successfully.",
            user: {
                id: user._id,
                username: user.userName,
                email: user.email,
                role: user.role,
            },
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let deleteUser = async (req, res, next) => {
    try {
        await userModel.findByIdAndRemove(req.params.userId)
        res.status(200).json({
            message: "User deleted successfully.",
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let addDrug = async (req, res, next) => {
    const { name, activeIngredient, category, price } = req.body
    try {
        let drug = await drugModel
            .insertMany({
                name,
                activeIngredient,
                category,
                price,
            })
            .select("-__v")
        res.status(200).json({
            message: "Drug added successfully.",
            drug,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let deleteDrug = async (req, res, next) => {
    try {
        await drugModel.findByIdAndRemove(req.params.drugId)
        res.status(200).json({
            message: "Drug deleted successfully.",
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let editDrug = async (req, res) => {
    const { name, activeIngredient, category, price } = req.body
    try {
        let drug = await drugModel
            .findByIdAndUpdate(
                req.params.drugId,
                {
                    name,
                    activeIngredient,
                    category,
                    price,
                },
                { new: true }
            )
            .select("-__v")
        res.status(200).json({
            message: "Drug updated successfully.",
            drug,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}
let getallOrders = async (req, res, next) => {
    try {
        const orders = await orderModel
            .find()
            .populate("user", "userName email -_id")
            .populate("items.drug", "name -_id")
            .select("-items._id")
            .select("-_id -__v")

        if (!orders) {
            const error = new Error("Could not find any order")
            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            message: "Fetched orders successfully.",
            orders,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let getOrdersByUser = async (req, res, next) => {
    const userId = req.params.userId
    try {
        const orders = await orderModel.find({ user: userId })
        if (!orders) {
            const error = new Error("Could not find any order")

            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            message: "Fetched orders successfully.",
            orders: orders.map((orders) => {
                return {
                    id: orders._id,
                    user: orders.user,
                    items: orders.items,
                    totalPrice: orders.totalPrice,
                    phone: orders.phone,
                    address: orders.shippingAddress,
                    status: orders.status,
                }
            }),
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }

        next(err)
    }
}

module.exports = {
    getallUsers,
    getUser,
    deleteUser,
    addDrug,
    deleteDrug,
    editDrug,
    getallOrders,
    getOrdersByUser,
}
