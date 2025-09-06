const { StatusCodes } = require("http-status-codes")

module.exports = (schema) => {
    try {
        return (req, res, next) => {
            var validation = []
            var validationResult = schema.body.validate(req.body)
            if (validationResult.error) {
                //if there is any errors in the validation
                validation.push(validationResult.error.details[0].message)
            }
            if (validation.length) {
                res.status(StatusCodes.BAD_REQUEST)
                res.json({
                    message: validation.join(","),
                    //join take the array and turn it into string
                    // Code: getReasonPhrase(StatusCodes.BAD_REQUEST),
                })
                return
            }

            next()
        }
    } catch (err) {
        const error = new Error(err)
        throw error
    }
}
