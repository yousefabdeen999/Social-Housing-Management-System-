const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    searchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Drug",
        },
    ],
    orderHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
})

userSchema.pre("save", async function (next) {
    try {
        if (this.isNew || this.isModified("password")) {
            const salt = await bcrypt.genSalt(7)
            const hashedPassword = await bcrypt.hash(this.password, salt)
            this.password = hashedPassword
        }
        next()
    } catch (err) {
        next(err)
    }
})

userSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (err) {
        throw err
    }
}

const User = mongoose.model("User", userSchema)

module.exports = User
