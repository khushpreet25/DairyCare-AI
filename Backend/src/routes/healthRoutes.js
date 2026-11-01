const express = require("express");
const mongoose = require("mongoose");

const HealthRecord = require("../models/HealthRecord");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const createAuditLog = require("../services/auditLogService");

const validateHealthRecord = require("../validators/healthValidator");

const router = express.Router();


// =====================================================
// HELPER
// CHECK WHETHER USER CAN ACCESS ANIMAL
// =====================================================
//
// Admin        → Can access any animal
// Veterinarian → Can access any animal
// Farmer       → Only animals from own farms
//
// =====================================================

async function checkAnimalAccess(animalId, req) {

    try {

        // -------------------------------------------------
        // Validate MongoDB ObjectId
        // -------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(animalId)
        ) {

            return {
                allowed: false,
                status: 400,
                message: "Invalid animal ID"
            };

        }


        // -------------------------------------------------
        // Find animal
        // -------------------------------------------------

        const animal =
            await Animal.findById(animalId);


        if (!animal) {

            return {
                allowed: false,
                status: 404,
                message: "Animal not found"
            };

        }


        // -------------------------------------------------
        // ADMIN
        // -------------------------------------------------

        if (
            req.user.role === "admin"
        ) {

            return {
                allowed: true,
                animal
            };

        }


        // -------------------------------------------------
        // VETERINARIAN
        // -------------------------------------------------

        if (
            req.user.role === "veterinarian"
        ) {

            return {
                allowed: true,
                animal
            };

        }


        // -------------------------------------------------
        // FARMER
        // Check whether animal belongs to farmer's farm
        // -------------------------------------------------

        const farm =
            await Farm.findOne({

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


        // -------------------------------------------------
        // ACCESS GRANTED
        // -------------------------------------------------

        return {
            allowed: true,
            animal,
            farm
        };


    } catch (error) {

        console.error(
            "Animal access check error:",
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
// CREATE HEALTH RECORD
// POST /api/health
//
// Only veterinarian/admin
// =====================================================

router.post(
    "/",
    protect,
    authorizeRoles(
        "veterinarian",
        "admin"
    ),
    validateHealthRecord,

    async (req, res) => {

        try {

            const {
                animalId,
                temperature,
                appetite,
                activityLevel,
                milkProduction,
                symptoms,
                notes
            } = req.body;


            // -------------------------------------------------
            // Required animal ID
            // -------------------------------------------------

            if (!animalId) {

                return res.status(400).json({

                    message:
                        "Animal ID is required"

                });

            }


            // -------------------------------------------------
            // CHECK ANIMAL ACCESS
            // -------------------------------------------------

            const access =
                await checkAnimalAccess(
                    animalId,
                    req
                );


            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    message:
                        access.message

                });

            }


            // -------------------------------------------------
            // CREATE HEALTH RECORD
            // -------------------------------------------------

            const healthRecord =
                await HealthRecord.create({

                    animalId,

                    temperature,

                    appetite,

                    activityLevel,

                    milkProduction,

                    symptoms,

                    notes

                });


            // -------------------------------------------------
            // AUDIT LOG
            // -------------------------------------------------

            try {

                await createAuditLog({

                    userId:
                        req.user.userId,

                    action:
                        "CREATE",

                    module:
                        "HEALTH_RECORD",

                    description:
                        `Created a health record for animal ${animalId}`,

                    ipAddress:
                        req.ip

                });

            } catch (auditError) {

                console.error(
                    "Health record audit error:",
                    auditError
                );

            }


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(201).json({

                message:
                    "Health record created successfully",

                healthRecord

            });


        } catch (error) {

            console.error(
                "Health record creation error:",
                error
            );

            return res.status(500).json({

                message:
                    "Health record creation failed",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// GET ALL HEALTH RECORDS FOR ONE ANIMAL
// GET /api/health/:animalId
//
// Authenticated users
//
// Veterinarian → allowed
// Admin        → allowed
// Farmer       → only own farm animals
// =====================================================

router.get(
    "/:animalId",
    protect,

    async (req, res) => {

        try {

            const {
                animalId
            } = req.params;


            // -------------------------------------------------
            // CHECK ANIMAL ACCESS
            // -------------------------------------------------

            const access =
                await checkAnimalAccess(
                    animalId,
                    req
                );


            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    message:
                        access.message

                });

            }


            // -------------------------------------------------
            // FIND HEALTH RECORDS
            // -------------------------------------------------

            const healthRecords =
                await HealthRecord.find({

                    animalId

                }).sort({

                    createdAt:
                        -1

                });


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(200).json({

                message:
                    "Health records fetched successfully",

                healthRecords

            });


        } catch (error) {

            console.error(
                "Fetch health records error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to fetch health records",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// GET SINGLE HEALTH RECORD
// GET /api/health/single/:id
// =====================================================

router.get(
    "/single/:id",
    protect,

    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            // -------------------------------------------------
            // VALIDATE HEALTH RECORD ID
            // -------------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid health record ID"

                });

            }


            // -------------------------------------------------
            // FIND HEALTH RECORD
            // -------------------------------------------------

            const healthRecord =
                await HealthRecord.findById(id);


            if (!healthRecord) {

                return res.status(404).json({

                    message:
                        "Health record not found"

                });

            }


            // -------------------------------------------------
            // CHECK ANIMAL ACCESS
            // -------------------------------------------------

            const access =
                await checkAnimalAccess(
                    healthRecord.animalId,
                    req
                );


            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    message:
                        access.message

                });

            }


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(200).json({

                message:
                    "Health record fetched successfully",

                healthRecord

            });


        } catch (error) {

            console.error(
                "Fetch single health record error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to fetch health record",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// UPDATE HEALTH RECORD
// PUT /api/health/:id
//
// Only veterinarian/admin
// =====================================================

router.put(
    "/:id",

    protect,

    authorizeRoles(
        "veterinarian",
        "admin"
    ),

    validateHealthRecord,

    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            // -------------------------------------------------
            // VALIDATE HEALTH RECORD ID
            // -------------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid health record ID"

                });

            }


            // -------------------------------------------------
            // FIND EXISTING HEALTH RECORD
            // -------------------------------------------------

            const healthRecord =
                await HealthRecord.findById(id);


            if (!healthRecord) {

                return res.status(404).json({

                    message:
                        "Health record not found"

                });

            }


            // -------------------------------------------------
            // CHECK CURRENT ANIMAL ACCESS
            // -------------------------------------------------

            const currentAccess =
                await checkAnimalAccess(
                    healthRecord.animalId,
                    req
                );


            if (!currentAccess.allowed) {

                return res.status(
                    currentAccess.status
                ).json({

                    message:
                        currentAccess.message

                });

            }


            // -------------------------------------------------
            // GET UPDATE DATA
            // -------------------------------------------------

            const {
                animalId,
                temperature,
                appetite,
                activityLevel,
                milkProduction,
                symptoms,
                notes
            } = req.body;


            // -------------------------------------------------
            // CHECK NEW ANIMAL
            //
            // Important:
            // Prevent changing the health record to an
            // unauthorized animal.
            // -------------------------------------------------

            if (
                animalId &&
                animalId.toString() !==
                healthRecord.animalId.toString()
            ) {

                const newAnimalAccess =
                    await checkAnimalAccess(
                        animalId,
                        req
                    );


                if (
                    !newAnimalAccess.allowed
                ) {

                    return res.status(
                        newAnimalAccess.status
                    ).json({

                        message:
                            "You do not have permission to assign this health record to the selected animal"

                    });

                }


                healthRecord.animalId =
                    animalId;

            }


            // -------------------------------------------------
            // UPDATE FIELDS
            // -------------------------------------------------

            if (
                temperature !== undefined
            ) {

                healthRecord.temperature =
                    temperature;

            }


            if (
                appetite !== undefined
            ) {

                healthRecord.appetite =
                    appetite;

            }


            if (
                activityLevel !== undefined
            ) {

                healthRecord.activityLevel =
                    activityLevel;

            }


            if (
                milkProduction !== undefined
            ) {

                healthRecord.milkProduction =
                    milkProduction;

            }


            if (
                symptoms !== undefined
            ) {

                healthRecord.symptoms =
                    symptoms;

            }


            if (
                notes !== undefined
            ) {

                healthRecord.notes =
                    notes;

            }


            // -------------------------------------------------
            // SAVE
            // -------------------------------------------------

            await healthRecord.save();


            // -------------------------------------------------
            // AUDIT LOG
            // -------------------------------------------------

            try {

                await createAuditLog({

                    userId:
                        req.user.userId,

                    action:
                        "UPDATE",

                    module:
                        "HEALTH_RECORD",

                    description:
                        `Updated health record ${healthRecord._id}`,

                    ipAddress:
                        req.ip

                });

            } catch (auditError) {

                console.error(
                    "Health record update audit error:",
                    auditError
                );

            }


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(200).json({

                message:
                    "Health record updated successfully",

                healthRecord

            });


        } catch (error) {

            console.error(
                "Update health record error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to update health record",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// DELETE HEALTH RECORD
// DELETE /api/health/:id
//
// Only veterinarian/admin
// =====================================================

router.delete(
    "/:id",

    protect,

    authorizeRoles(
        "veterinarian",
        "admin"
    ),

    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            // -------------------------------------------------
            // VALIDATE ID
            // -------------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid health record ID"

                });

            }


            // -------------------------------------------------
            // FIND HEALTH RECORD
            // -------------------------------------------------

            const healthRecord =
                await HealthRecord.findById(id);


            if (!healthRecord) {

                return res.status(404).json({

                    message:
                        "Health record not found"

                });

            }


            // -------------------------------------------------
            // CHECK ANIMAL ACCESS
            // -------------------------------------------------

            const access =
                await checkAnimalAccess(
                    healthRecord.animalId,
                    req
                );


            if (!access.allowed) {

                return res.status(
                    access.status
                ).json({

                    message:
                        access.message

                });

            }


            // -------------------------------------------------
            // DELETE
            // -------------------------------------------------

            await HealthRecord.findByIdAndDelete(
                id
            );


            // -------------------------------------------------
            // AUDIT LOG
            // -------------------------------------------------

            try {

                await createAuditLog({

                    userId:
                        req.user.userId,

                    action:
                        "DELETE",

                    module:
                        "HEALTH_RECORD",

                    description:
                        `Deleted health record ${id}`,

                    ipAddress:
                        req.ip

                });

            } catch (auditError) {

                console.error(
                    "Health record delete audit error:",
                    auditError
                );

            }


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(200).json({

                message:
                    "Health record deleted successfully"

            });


        } catch (error) {

            console.error(
                "Delete health record error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to delete health record",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;