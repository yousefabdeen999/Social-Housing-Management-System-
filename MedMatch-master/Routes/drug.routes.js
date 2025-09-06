const route = require("express").Router()
const drugController = require("../Controllers/drug.controllers")
const isAuth = require("../Middleware/isAuth")

route.get("/drugs", isAuth, drugController.getAllDrugs)
route.get("/drug/:drugId", isAuth, drugController.getDrug)
route.get("/similarDrugs/:drugId", drugController.similarDrugs)
route.get("/search", drugController.drugSearch)
route.delete(
    "/deleteSearchHistory/:drugId",
    isAuth,
    drugController.deleteSearchHistory
)
route.delete("/deleteAllHistory", isAuth, drugController.deleteAllHistory)
module.exports = route
