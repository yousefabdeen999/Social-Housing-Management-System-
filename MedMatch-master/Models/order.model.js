const mongoose = require("mongoose")
const cartModel = require("./cart.model")
const Schema = mongoose.Schema
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            drug: {
                type: Schema.Types.ObjectId,
                ref: "Drug",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },

    shippingAddress: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["creditCard", "paypal", "cashOnDelivery"],
        required: true,
        default: "cashOnDelivery",
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

orderSchema.pre("save", async function (next) {
    const cart = await cartModel.findOne({ user: this.user })
    if (cart) {
        this.items = cart.items.map((item) => ({
            drug: item.drug,
            quantity: item.quantity,
            price: item.price,
        }))
        this.totalPrice = cart.getTotalPrice()
    }
    next()
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
