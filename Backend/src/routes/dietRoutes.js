const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const DietPlan = require("../models/DietPlan");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");

const protect = require("../middleware/authMiddleware");
const validateDietPlan = require("../validators/DietValidator");
const createAuditLog = require("../services/auditLogService");


// =====================================================
// HELPER
// CHECK WHETHER USER CAN ACCESS ANIMAL
// =====================================================

async function checkAnimalAccess(animalId, req) {

    try {

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(animalId)) {

            return {
                allowed: false,
                status: 400,
                message: "Invalid animal ID"
            };

        }

        // Find animal
        const animal = await Animal.findById(animalId);

        if (!animal) {

            return {
                allowed: false,
                status: 404,
                message: "Animal not found"
            };

        }

        // ADMIN
        if (req.user.role === "admin") {

            return {
                allowed: true,
                animal
            };

        }

        // FARMER
        if (req.user.role === "farmer") {

            const farm = await Farm.findOne({
                _id: animal.farmId,
                ownerId: req.user.userId
            });

            if (!farm) {

                return {
                    allowed: false,
                    status: 403,
                    message:
                        "You do not have permission to access this animal"
                };

            }

            return {
                allowed: true,
                animal,
                farm
            };

        }

        // VETERINARIAN
        if (req.user.role === "veterinarian") {

            return {
                allowed: true,
                animal
            };

        }

        // OTHER ROLES
        return {
            allowed: false,
            status: 403,
            message:
                "You do not have permission to access this animal"
        };

    } catch (error) {

        console.error(
            "Diet plan animal access error:",
            error
        );

        return {
            allowed: false,
            status: 500,
            message:
                "Failed to verify animal access"
        };

    }

}


// =====================================================
// TEST ROUTE
// GET /api/diet-plans/test
// =====================================================

router.get(
    "/test",
    protect,
    (req, res) => {

        return res.status(200).json({

            success: true,

            message:
                "Diet routes are working"

        });

    }
);


// =====================================================
// CREATE DIET PLAN
// POST /api/diet-plans
// =====================================================

router.post(
    "/",
    protect,
    validateDietPlan,
    async (req, res) => {

        try {

            const {
                animalId,
                feedName,
                quantity,
                feedingTime,
                nutritionalNotes,
                startDate,
                endDate
            } = req.body;

            // Check animal access
            const access =
                await checkAnimalAccess(
                    animalId,
                    req
                );

            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    success: false,

                    message:
                        access.message

                });

            }

            // Create diet plan
            const dietPlan =
                await DietPlan.create({

                    animalId,

                    feedName:
                        feedName.trim(),

                    quantity:
                        Number(quantity),

                    feedingTime,

                    nutritionalNotes:
                        nutritionalNotes || "",

                    startDate,

                    endDate

                });

            // Audit log
            try {

                await createAuditLog({

                    userId:
                        req.user.userId,

                    action:
                        "CREATE",

                    module:
                        "DIET PLAN",

                    description:
                        `Created diet plan for ${
                            access.animal.name ||
                            access.animal.animalTagId
                        }`,

                    ipAddress:
                        req.ip

                });

            } catch (auditError) {

                console.error(
                    "Diet plan audit error:",
                    auditError
                );

            }

            return res.status(201).json({

                success: true,

                message:
                    "Diet plan created successfully",

                dietPlan

            });

        } catch (error) {

            console.error(
                "CREATE DIET PLAN ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Diet plan creation failed",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// GET ALL DIET PLANS FOR AN ANIMAL
// GET /api/diet-plans/:animalId
//
// This is the route your current frontend is calling.
// =====================================================

router.get(
    "/:animalId",
    protect,
    async (req, res) => {

        try {

            const {
                animalId
            } = req.params;

            // Check animal access
            const access =
                await checkAnimalAccess(
                    animalId,
                    req
                );

            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    success: false,

                    message:
                        access.message

                });

            }

            // Get diet plans
            const dietPlans =
                await DietPlan.find({
                    animalId
                }).sort({
                    createdAt: -1
                });

            return res.status(200).json({

                success: true,

                message:
                    "Diet plans fetched successfully",

                count:
                    dietPlans.length,

                dietPlans

            });

        } catch (error) {

            console.error(
                "GET DIET PLANS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch diet plans",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// GET ALL DIET PLANS FOR AN ANIMAL
// GET /api/diet-plans/animal/:animalId
//
// This is kept as an alternative endpoint.
// =====================================================

router.get(
    "/animal/:animalId",
    protect,
    async (req, res) => {

        try {

            const {
                animalId
            } = req.params;

            // Check animal access
            const access =
                await checkAnimalAccess(
                    animalId,
                    req
                );

            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    success: false,

                    message:
                        access.message

                });

            }

            // Get diet plans
            const dietPlans =
                await DietPlan.find({
                    animalId
                }).sort({
                    createdAt: -1
                });

            return res.status(200).json({

                success: true,

                message:
                    "Diet plans fetched successfully",

                count:
                    dietPlans.length,

                dietPlans

            });

        } catch (error) {

            console.error(
                "GET DIET PLANS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch diet plans",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// GET SINGLE DIET PLAN
// GET /api/diet-plans/details/:id
// =====================================================

router.get(
    "/details/:id",
    protect,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            // Validate diet plan ID
            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid diet plan ID"

                });

            }

            // Find diet plan
            const dietPlan =
                await DietPlan.findById(id);

            if (!dietPlan) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Diet plan not found"

                });

            }

            // Check access to animal
            const access =
                await checkAnimalAccess(
                    dietPlan.animalId,
                    req
                );

            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    success: false,

                    message:
                        access.message

                });

            }

            return res.status(200).json({

                success: true,

                message:
                    "Diet plan fetched successfully",

                dietPlan

            });

        } catch (error) {

            console.error(
                "GET DIET PLAN ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch diet plan",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// UPDATE DIET PLAN
// PUT /api/diet-plans/:id
// =====================================================

router.put(
    "/:id",
    protect,
    validateDietPlan,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            // Validate ID
            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid diet plan ID"

                });

            }

            // Find diet plan
            const dietPlan =
                await DietPlan.findById(id);

            if (!dietPlan) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Diet plan not found"

                });

            }

            // Check current animal access
            const currentAccess =
                await checkAnimalAccess(
                    dietPlan.animalId,
                    req
                );

            if (!currentAccess.allowed) {

                return res.status(
                    currentAccess.status
                ).json({

                    success: false,

                    message:
                        currentAccess.message

                });

            }

            // New animal
            const newAnimalId =
                req.body.animalId ||
                dietPlan.animalId;

            // Check new animal access
            const newAccess =
                await checkAnimalAccess(
                    newAnimalId,
                    req
                );

            if (!newAccess.allowed) {

                return res.status(
                    newAccess.status
                ).json({

                    success: false,

                    message:
                        "You cannot assign this diet plan to this animal"

                });

            }

            // Update fields
            dietPlan.animalId =
                newAnimalId;

            if (
                req.body.feedName !== undefined
            ) {

                dietPlan.feedName =
                    req.body.feedName.trim();

            }

            if (
                req.body.quantity !== undefined
            ) {

                dietPlan.quantity =
                    Number(req.body.quantity);

            }

            if (
                req.body.feedingTime !== undefined
            ) {

                dietPlan.feedingTime =
                    req.body.feedingTime;

            }

            if (
                req.body.nutritionalNotes !== undefined
            ) {

                dietPlan.nutritionalNotes =
                    req.body.nutritionalNotes;

            }

            if (
                req.body.startDate !== undefined
            ) {

                dietPlan.startDate =
                    req.body.startDate;

            }

            if (
                req.body.endDate !== undefined
            ) {

                dietPlan.endDate =
                    req.body.endDate;

            }

            await dietPlan.save();

            // Audit log
            try {

                await createAuditLog({

                    userId:
                        req.user.userId,

                    action:
                        "UPDATE",

                    module:
                        "DIET PLAN",

                    description:
                        `Updated diet plan ${dietPlan._id}`,

                    ipAddress:
                        req.ip

                });

            } catch (auditError) {

                console.error(
                    "Diet plan update audit error:",
                    auditError
                );

            }

            return res.status(200).json({

                success: true,

                message:
                    "Diet plan updated successfully",

                dietPlan

            });

        } catch (error) {

            console.error(
                "UPDATE DIET PLAN ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to update diet plan",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// DELETE DIET PLAN
// DELETE /api/diet-plans/:id
// =====================================================

router.delete(
    "/:id",
    protect,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            // Validate ID
            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid diet plan ID"

                });

            }

            // Find diet plan
            const dietPlan =
                await DietPlan.findById(id);

            if (!dietPlan) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Diet plan not found"

                });

            }

            // Check access
            const access =
                await checkAnimalAccess(
                    dietPlan.animalId,
                    req
                );

            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    success: false,

                    message:
                        access.message

                });

            }

            await DietPlan.findByIdAndDelete(id);

            // Audit log
            try {

                await createAuditLog({

                    userId:
                        req.user.userId,

                    action:
                        "DELETE",

                    module:
                        "DIET PLAN",

                    description:
                        `Deleted diet plan ${dietPlan._id}`,

                    ipAddress:
                        req.ip

                });

            } catch (auditError) {

                console.error(
                    "Diet plan delete audit error:",
                    auditError
                );

            }

            return res.status(200).json({

                success: true,

                message:
                    "Diet plan deleted successfully"

            });

        } catch (error) {

            console.error(
                "DELETE DIET PLAN ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to delete diet plan",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;