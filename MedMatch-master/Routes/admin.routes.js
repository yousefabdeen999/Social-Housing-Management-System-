const route = require("express").Router()
const adminController = require("../Controllers/admin.controllers")
const validator = require("../Middleware/validator")
const { drugSchema } = require("../Validation/drugValidator")
const isAdmin = require("../Middleware/isAdmin")

route.get("/allUsers", isAdmin, adminController.getallUsers)
route.get("/user/:userId", isAdmin, adminController.getUser)
route.delete("/deleteUser/:userId", isAdmin, adminController.deleteUser)
route.post("/addDrug", isAdmin, validator(drugSchema), adminController.addDrug)
route.put(
    "/editDrug/:drugId",
    isAdmin,
    validator(drugSchema),
    adminController.editDrug
)
route.delete("/deleteDrug/:drugId", isAdmin, adminController.deleteDrug)
route.get("/Orders", isAdmin, adminController.getallOrders)
route.get("/OrdersByUser/:userId", isAdmin, adminController.getallOrders)

module.exports = route
