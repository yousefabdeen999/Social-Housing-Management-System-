const drugModel = require("../Models/drug.model")
const userModel = require("../Models/user.model")

let getAllDrugs = async (req, res, next) => {
    const currentPage = req.query.page || 1 // if there is no page in the query it will be 1
    const perPage = req.query.perPage || 6 // number of drugs per page
    let totalDrugs // total number of drugs

    try {
        const count = await drugModel.find().countDocuments() // count the number of drugs
        totalDrugs = count
        const drugs = await drugModel
            .find()
            .select(" -category -__v") // select the name and activeIngredient fields

            .skip((currentPage - 1) * perPage) // skip the number of drugs that we want to skip
            // so here in the skip we won't skip the first page
            .limit(perPage) // limit the number of drugs that we want to get

        if (!drugs) {
            const error = new Error("Could not find any post")
            error.statusCode = 404
            throw error
        }

        res.status(200).json({
            message: "Fetched drugs successfully.",
            drugs,
            totalDrugs,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}
let getDrug = async (req, res, next) => {
    try {
        // Find the drug by ID
        let drug = await drugModel.findById(req.params.drugId).select("-__v")

        // Find the user by ID
        const user = await userModel.findById(req.user.userId)

        // If drug is not found, throw a 404 error
        if (!drug || drug.length === 0) {
            const error = new Error("Could not find any drug")
            error.statusCode = 404
            throw error
        }

        // Send the drug data in the response body
        res.status(200).json({
            message: "Fetched drug successfully.",
            drug,
        })

        // Add the drug ID to the user's history array and save the user
        // Avoid the Duplicated Search History
        if (user.searchHistory.includes(req.params.drugId)) {
            return await user.save()
        } else {
            user.searchHistory.push(req.params.drugId)
            await user.save()
        }
    } catch (err) {
        // Handle errors
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}
let similarDrugs = async (req, res, next) => {
    try {
        const currentPage = req.query.page || 1
        const perPage = req.query.perPage || 6
        let totalDrugs
        let drug = await drugModel.findById(req.params.drugId)
        const count = await drugModel
            .find({
                activeIngredient: drug.activeIngredient,
            })
            .countDocuments()
        totalDrugs = count
        let similarDrugs = await drugModel
            .find({
                activeIngredient: drug.activeIngredient,
            })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            // .select(" -category") // select the name and activeIngredient fields
            .sort({ price: 1 })
        res.status(200).json({
            message: "Fetched similar drugs successfully.",
            similarDrugs,
            totalDrugs,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let drugSearch = async (req, res, next) => {
    const search = req.query.search
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 6
    let totalDrugs
    try {
        const count = await drugModel
            .find({
                name: { $regex: "^" + search, $options: "i" },
            })
            .countDocuments() // count the number of drugs
        totalDrugs = count

        const drugs = await drugModel
            .find({
                name: { $regex: "^" + search, $options: "i" },
            })
            .select(" -category") // select the name and activeIngredient fields
            // pagination
            .skip((currentPage - 1) * perPage)
            .limit(perPage)

        if (!drugs || drugs.length === 0) {
            const error = new Error("The drug is not found")
            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            message: "Fetched drugs successfully.",
            drugs,
            totalDrugs,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

const deleteSearchHistory = async (req, res, next) => {
    try {
        const userId = req.user.userId
        const drugId = req.params.drugId

        // Find the user and update their history by removing the drug ID
        await userModel.findByIdAndUpdate(
            userId,
            { $pull: { searchHistory: drugId } } // $pull removes the drug ID from the history array
            // { new: true }
        )

        // Send a response with the updated user object
        res.status(200).json({
            message: "Drug deleted successfully from user history.",
            // user,
        })
    } catch (err) {
        // Handle errors
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

let deleteAllHistory = async (req, res, next) => {
    try {
        const userId = req.user.userId
        // Find the user and update their history by removing the drug ID
        await userModel.findByIdAndUpdate(
            userId,
            { $set: { searchHistory: [] } } // $pull removes the drug ID from the history array
            // { new: true }
        )

        // Send a response with the updated user object
        res.status(200).json({
            message: "All history deleted successfully.",
            // user,
        })
    } catch (err) {
        // Handle errors
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

module.exports = {
    getAllDrugs,
    getDrug,
    similarDrugs,
    drugSearch,
    deleteSearchHistory,
    deleteAllHistory,
}
