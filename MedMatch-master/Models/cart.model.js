const mongoose = require("mongoose")
const Schema = mongoose.Schema

const cartSchema = new Schema({
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
                min: [1, "Quantity can not be less then 1."],
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

cartSchema.methods.getTotalPrice = function () {
    let totalPrice = 0
    this.items.forEach((item) => {
        totalPrice += item.quantity * item.price
    })
    return totalPrice
}

const Cart = mongoose.model("Cart", cartSchema)

module.exports = Cart
