const route = require("express").Router()
const orderController = require("../Controllers/order.controllers")
const isAuth = require("../Middleware/isAuth")

route.post("/checkout", isAuth, orderController.checkout)
route.get("/Orders", isAuth, orderController.getOrders)
route.delete("/cancelOrder/:orderId", isAuth, orderController.cancelOrder)
route.delete(
    "/deleteOrderHistory/:orderId",
    isAuth,
    orderController.deleteOrderHistory
)

module.exports = route
