const route = require("express").Router()
const cartController = require("../Controllers/cart.controllers")
const isAuth = require("../Middleware/isAuth")

route.post("/addToCart/:drugId", isAuth, cartController.addItemToCart)
route.get("/", isAuth, cartController.getCartItems)
route.delete("/removeItem/:itemId", isAuth, cartController.removeItemFromCart)

module.exports = route
