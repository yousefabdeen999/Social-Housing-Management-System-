const route = require("express").Router()
const userController = require("../Controllers/user.controllers")
const validator = require("../Middleware/validator")
const isAuth = require("../Middleware/isAuth")
const userSchema = require("../Validation/userValidator")

route.post("/signup", validator(userSchema.signupSchema), userController.signup)
route.get("/verify", userController.verify)
route.post("/login", validator(userSchema.loginSchema), userController.login)
route.get("/profile", isAuth, userController.userProfile)
route.put("/editUser", isAuth, userController.editUser)
route.post("/forgetPassword", userController.forgetPassword)
route.put(
    "/reset-password",
    validator(userSchema.forgetPasswordSchema),
    userController.resetPassword
)

module.exports = route
