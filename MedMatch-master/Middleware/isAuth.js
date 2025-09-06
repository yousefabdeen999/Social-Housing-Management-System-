const jwt = require("jsonwebtoken")
// const rbac = require('../Auth/RBAC/rbac')
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization")
    if (!authHeader) {
        const error = new Error("Not authenticated.")
        error.statusCode = 401
        throw error
    }
    const token = authHeader.split(" ")[1] // Bearer TOKEN
    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.TOKEN_HASH)
    } catch (err) {
        err.statusCode = 500
        throw err
    }
    if (!decodedToken) {
        const error = new Error("Not authenticated.")
        error.statusCode = 401
        throw error
    }
    req.user = decodedToken
    next()
}
