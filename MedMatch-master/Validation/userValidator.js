const joi = require("joi")
const strongPasswordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

module.exports = {
    signupSchema: {
        body: joi
            .object()
            .required()
            .keys({
                userName: joi.string().required().messages({
                    "string.empty": "Display name cannot be empty",
                }), //
                email: joi
                    .string()
                    .required()
                    .email()
                    .message("Must be a valid email address"),

                password: joi
                    .string()
                    .regex(strongPasswordRegex)
                    .message({
                        "string.pattern.base":
                            "Password must be strong. At least one upper case alphabet. At least one lower case alphabet. At least one digit. At least one special character. Minimum eight in length",
                    })
                    .required()
                    .min(8)
                    .max(20),
                confirmPassword: joi
                    .string()
                    .equal(joi.ref("password"))
                    .required()
                    .label("Confirm password")
                    .messages({
                        // any.only is a joi error code
                        "any.only": "Passwords do not matching",
                    }),
                createdAt: joi.date().default(Date.now),
            }),
    },
    loginSchema: {
        body: joi.object().required().keys({
            email: joi.string().email().required(),
            password: joi.string().required(),
        }),
    },
    forgetPasswordSchema: {
        body: joi
            .object()
            .required()
            .keys({
                password: joi
                    .string()
                    .regex(strongPasswordRegex)
                    .message({
                        "string.pattern.base":
                            "Password must be strong. At least one upper case alphabet. At least one lower case alphabet. At least one digit. At least one special character. Minimum eight in length",
                    })
                    .required()
                    .min(8)
                    .max(20),
                confirmPassword: joi
                    .string()
                    .equal(joi.ref("password"))
                    .required()
                    .label("Confirm password")
                    .messages({
                        // any.only is a joi error code
                        "any.only": "Passwords do not matching",
                    }),
            }),
    },
}
