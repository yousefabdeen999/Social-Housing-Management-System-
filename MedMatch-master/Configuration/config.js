const mongoose = require("mongoose")
require("dotenv").config()

const connection = async (app) => {
    try {
        await mongoose
            .set("strictQuery", false)
            .connect(process.env.CONNECTION_STRING, 
            )
        app.listen(process.env.PORT || 3000, () =>
            console.log(`Server is connecting on Port ${process.env.PORT}`)
        )
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 503
        }
        throw err
    }
}

module.exports = connection
