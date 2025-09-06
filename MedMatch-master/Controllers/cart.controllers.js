const cartModel = require("../Models/cart.model")
const drugModel = require("../Models/drug.model")

let addItemToCart = async (req, res, next) => {
    const quantity = req.body.quantity || 1 // If the quantity is not specified, set it to 1
    const { drugId } = req.params
    const userId = req.user.userId

    try {
        // Check if the user already has a cart
        let cart = await cartModel.findOne({ user: userId }).select("-__v")

        // If the user doesn't have a cart, create a new one
        if (!cart) {
            cart = new cartModel({
                user: userId,
                items: [],
            })
        }

        // Check if the item is already in the cart
        const itemIndex = cart.items.findIndex((item) =>
            item.drug.equals(drugId)
        )
        let drug = await drugModel.findById(drugId)

        //findindex returns -1 if the item is not in the cart

        // If the item is already in the cart, update the quantity
        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity = quantity
            // itemIndex is the index of the item in the cart
        } else {
            // If the item is not in the cart, add it
            const item = {
                drug: drugId,
                quantity,
                price: drug.price,
            }
            cart.items.push(item)
        }

        // Save the cart
        await cart.save()

        res.status(200).json({ Message: "Item added to cart" })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let getCartItems = async (req, res, next) => {
    const userId = req.user.userId

    try {
        // Find the user's cart and populate the drug information
        const cart = await cartModel
            .findOne({ user: userId })
            .populate("items.drug", "name -_id")
            .populate("user", "userName email -_id")
            .select("-__v")
        if (!cart || cart.items.length === 0) {
            const error = new Error("No items in cart")
            error.statusCode = 204
            throw error
        }

        const totalPrice = cart.getTotalPrice()

        res.status(200).json({
            Message: "Fetched Cart Items",
            cart,
            totalPrice,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let removeItemFromCart = async (req, res, next) => {
    const { itemId } = req.params
    const userId = req.user.userId

    try {
        // Find the user's cart
        const cart = await cartModel.findOne({ user: userId })

        // Remove the item from the cart
        cart.items = cart.items.filter((item) => !item._id.equals(itemId))

        await cart.save()

        res.status(200).json({ Message: "Item removed from cart" })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

module.exports = {
    addItemToCart,
    getCartItems,
    removeItemFromCart,
}
