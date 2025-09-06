//Global Modules:
const express = require("express")
const connection = require("./Configuration/config.js")
const app = express()
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const cors = require("cors")
const errorHandling = require("./Middleware/error-handling")
require("dotenv").config()

//Routes:
const logger = require("./Logs/logs.js")
const userRoutes = require("./Routes/user.routes")
const drugRoutes = require("./Routes/drug.routes")
const adminRoutes = require("./Routes/admin.routes")
const cartRoutes = require("./Routes/cart.routes")
const orderRoutes = require("./Routes/order.routes")

connection(app)

//Middleware:
app.use(logger)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
app.use(mongoSanitize())
app.use(cors())

app.use(userRoutes)
app.use(drugRoutes)
app.use("/admin", adminRoutes)
app.use("/cart", cartRoutes)
app.use("/order", orderRoutes)
app.use(errorHandling)
