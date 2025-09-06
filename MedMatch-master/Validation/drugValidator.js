const joi = require("joi")

module.exports = {
    drugSchema: {
        body: joi
            .object()
            .required()
            .keys({
                name: joi.string().required().messages({
                    "string.empty": "Display name cannot be empty",
                }),
                price: joi.number().required().messages({
                    "number.empty": "Price cannot be empty",
                }),
                activeIngredient: joi.string().required().messages({
                    "string.empty": "Active ingredient cannot be empty",
                }),
                category: joi.string().required().messages({
                    "string.empty": "Category cannot be empty",
                }),
            }),
    },
}
