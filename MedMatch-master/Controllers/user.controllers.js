const userModel = require("../Models/user.model")
const jwt = require("jsonwebtoken")
const sgMail = require("@sendgrid/mail")

let signup = async (req, res, next) => {
    const { email, password, userName } = req.body

    try {
        let existingUser = await userModel.findOne({ email })

        if (existingUser) {
            res.status(409).json({ message: "User already exists" })
        } else {
            let token = jwt.sign(
                { email, userName, password },
                process.env.TOKEN_HASH
            )
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            const msg = {
                to: `${email}`, // user email address
                from: ` ${process.env.EMAIL}`, // sender address
                subject: "Please verify your email address", // subject line
                html: `<!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Verify your email address</title>
              </head>
              <body>
                <div style="background-color: #f4f4f4; padding: 20px;">
                  <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Verify your email address</h2>
                    <p>Hi ${userName},</p>
                    <p>Please click on the following link to verify your email address:</p>
                    <p style="text-align: center; margin-top: 30px;"><a href="https://medmatch.onrender.com/verify?token=${token}" style="background-color: #4CAF50; color: #ffffff; padding: 12px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Verify Email</a></p>
                    <p>If you did not create an account with us, please ignore this email.</p>
                  </div>
                </div>
              </body>
              </html>
              `,
            }
            await sgMail.send(msg).then(
                res.status(201).json({
                    message:
                        "Thank you for registering! Please check your email to verify your account.",
                })
            )
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let verify = async (req, res, next) => {
    const { token } = req.query
    try {
        let decoded = jwt.verify(token, process.env.TOKEN_HASH)
        const newUser = new userModel({
            email: decoded.email,
            password: decoded.password,
            userName: decoded.userName,
        })
        await newUser.save().then(
            res.status(201).json({
                message: "Thank you for verifying your email address.",
            })
        )
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let login = async (req, res, next) => {
    const { email, password } = req.body
    try {
        let user = await userModel.findOne({ email })
        if (!user) {
            const error = new Error("User not found")
            error.statusCode = 401
            throw error
        } else {
            let isMatch = await user.isValidPassword(password)
            if (!isMatch) {
                const error = new Error("Incorrect password")
                error.statusCode = 401
                throw error
            } else {
                let token = jwt.sign(
                    {
                        email: user.email,
                        userId: user._id,
                        userName: user.userName,
                        role: user.role,
                    },
                    process.env.TOKEN_HASH,
                    { expiresIn: "1h" }
                )
                res.status(200).json({
                    token,
                    expiresIn: 3600,
                    message: "Login successful",
                    message: `Hello ${user.userName} `,
                })
            }
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let forgetPassword = async (req, res, next) => {
    const { email } = req.body
    try {
        const checkMail = await userModel.find({ email })
        if (!checkMail || checkMail.length === 0) {
            const error = new Error("Email not found")
            error.statusCode = 401
            throw error
        } else {
            let token = jwt.sign({ email }, process.env.TOKEN_HASH, {
                expiresIn: "1h",
            })
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            const msg = {
                to: `${email}`, // user email address
                from: ` ${process.env.EMAIL}`, // sender address
                subject: "Reset your password", // subject line
                html: `<!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Reset your password</title>
              </head>
              <body>
                <div style="background-color: #f4f4f4; padding: 20px;">
                  <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Reset your password</h2>
                    <p>Hi,</p>
                    <p>Please click on the following link to reset your password:</p>
                    <p style="text-align: center; margin-top: 30px;"><a href="http://localhost:3000/reset-password?token=${token}" style="background-color: #4CAF50; color: #ffffff; padding: 12px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a></p>
                    <p>If you did not request this, please ignore this email.</p>
                  </div>
                </div>
              </body>
              </html>
              `,
            }
            await sgMail.send(msg).then(
                res.status(201).json({
                    message: "Please check your email to reset your password.",
                })
            )
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let resetPassword = async (req, res, next) => {
    const { password } = req.body
    const { token } = req.query
    try {
        let decoded = jwt.verify(token, process.env.TOKEN_HASH)
        const user = await userModel.findOne({ email: decoded.email })
        user.password = password // change password
        await user.save().then(
            res.status(200).json({
                message: "Password changed successfully.",
            })
        )
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let userProfile = async (req, res, next) => {
    try {
        let user = await userModel
            .findById(req.user.userId)
            .select("-password -_id -__v")
            .populate("searchHistory orderHistory")
        res.status(200).json({
            message: "User profile fetched successfully.",
            user,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let editUser = async (req, res, next) => {
    const { userName } = req.body
    try {
        await userModel.findByIdAndUpdate(
            { _id: req.user.userId },
            { userName },
            { new: true }
        )

        res.status(200).json({
            message: "User updated successfully.",
            user: { userName },
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

module.exports = {
    signup,
    verify,
    login,
    forgetPassword,
    resetPassword,
    editUser,
    userProfile,
}
