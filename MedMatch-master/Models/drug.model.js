const mongoose = require("mongoose")
const Schema = mongoose.Schema

const drugSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    activeIngredient: { type: String, required: true },
    category: { type: String, required: true },
})

const Drug = mongoose.model("Drug", drugSchema)

module.exports = Drug
