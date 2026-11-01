const express = require("express");
const mongoose = require("mongoose");

const Farm = require("../models/Farm");
const Animal = require("../models/Animal");
const Injection = require("../models/Injection");
const DietPlan = require("../models/DietPlan");
const HealthRecord = require("../models/HealthRecord");

const protect = require("../middleware/authMiddleware");
const createAuditLog = require("../services/auditLogService");

const router = express.Router();


// =====================================================
// GET ACCESSIBLE ANIMAL IDS
// =====================================================
//
// ADMIN
// → All animals
//
// VETERINARIAN
// → All animals
//
// FARMER
// → Only animals belonging to own farms
//
// =====================================================

async function getAccessibleAnimalIds(req) {

    // -------------------------------------------------
    // ADMIN / VETERINARIAN
    // -------------------------------------------------

    if (
        req.user.role === "admin" ||
        req.user.role === "veterinarian"
    ) {

        const animals = await Animal.find({})
            .select("_id");

        return animals.map(
            animal => animal._id
        );
    }


    // -------------------------------------------------
    // FARMER
    // -------------------------------------------------

    const farms = await Farm.find({
        ownerId: req.user.userId
    }).select("_id");


    const farmIds = farms.map(
        farm => farm._id
    );


    const animals = await Animal.find({
        farmId: {
            $in: farmIds
        }
    }).select("_id");


    return animals.map(
        animal => animal._id
    );
}


// =====================================================
// REPORT ACCESS AUDIT
// =====================================================

async function logReportAccess(
    req,
    reportName
) {

    await createAuditLog({

        userId:
            req.user.userId,

        action:
            "VIEW",

        module:
            "REPORT",

        description:
            `Viewed ${reportName} report`,

        ipAddress:
            req.ip
    });
}


// =====================================================
// 1. FARM SUMMARY REPORT
// =====================================================
//
// GET /api/reports/farm-summary
//
// =====================================================

router.get(
    "/farm-summary",
    protect,
    async (req, res) => {

        try {

            let farms;


            // -------------------------------------------------
            // ADMIN / VETERINARIAN
            // -------------------------------------------------

            if (
                req.user.role === "admin" ||
                req.user.role === "veterinarian"
            ) {

                farms =
                    await Farm.find({})
                        .sort({
                            createdAt: -1
                        });

            }

            // -------------------------------------------------
            // FARMER
            // -------------------------------------------------

            else {

                farms =
                    await Farm.find({
                        ownerId:
                            req.user.userId
                    })
                    .sort({
                        createdAt: -1
                    });

            }


            const report = [];


            for (const farm of farms) {

                const animals =
                    await Animal.find({
                        farmId:
                            farm._id
                    }).select(
                        "_id name animalTagId breed gender milkProduction pregnancyStatus"
                    );


                const animalIds =
                    animals.map(
                        animal => animal._id
                    );


                const injections =
                    await Injection.countDocuments({
                        animalId: {
                            $in: animalIds
                        }
                    });


                const dietPlans =
                    await DietPlan.countDocuments({
                        animalId: {
                            $in: animalIds
                        }
                    });


                const healthRecords =
                    await HealthRecord.countDocuments({
                        animalId: {
                            $in: animalIds
                        }
                    });


                const totalMilk =
                    animals.reduce(
                        (
                            total,
                            animal
                        ) =>
                            total +
                            (
                                Number(
                                    animal.milkProduction
                                ) || 0
                            ),
                        0
                    );


                report.push({

                    farmId:
                        farm._id,

                    farmName:
                        farm.farmName,

                    location:
                        farm.location,

                    totalAnimals:
                        animals.length,

                    totalInjections:
                        injections,

                    totalDietPlans:
                        dietPlans,

                    totalHealthRecords:
                        healthRecords,

                    totalMilkProduction:
                        totalMilk

                });

            }


            await logReportAccess(
                req,
                "Farm Summary"
            );


            return res.status(200).json({

                success: true,

                message:
                    "Farm summary report fetched successfully",

                count:
                    report.length,

                data:
                    report

            });

        }

        catch (error) {

            console.error(
                "Farm summary report error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate farm summary report",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// 2. ANIMAL HEALTH REPORT
// =====================================================
//
// GET /api/reports/animal-health
//
// =====================================================

router.get(
    "/animal-health",
    protect,
    async (req, res) => {

        try {

            const animalIds =
                await getAccessibleAnimalIds(
                    req
                );


            const animals =
                await Animal.find({

                    _id: {
                        $in: animalIds
                    }

                })
                .populate(
                    "farmId",
                    "farmName location"
                )
                .sort({
                    createdAt: -1
                });


            const report = [];


            for (
                const animal of animals
            ) {

                const latestHealth =
                    await HealthRecord.findOne({

                        animalId:
                            animal._id

                    })
                    .sort({
                        createdAt: -1
                    });


                report.push({

                    animalId:
                        animal._id,

                    animalTagId:
                        animal.animalTagId,

                    animalName:
                        animal.name,

                    breed:
                        animal.breed,

                    gender:
                        animal.gender,

                    weight:
                        animal.weight,

                    milkProduction:
                        animal.milkProduction,

                    pregnancyStatus:
                        animal.pregnancyStatus,

                    farmName:
                        animal.farmId
                            ?.farmName || "N/A",

                    latestHealth: latestHealth
                        ? {

                            temperature:
                                latestHealth.temperature,

                            appetite:
                                latestHealth.appetite,

                            activityLevel:
                                latestHealth.activityLevel,

                            milkProduction:
                                latestHealth.milkProduction,

                            symptoms:
                                latestHealth.symptoms,

                            notes:
                                latestHealth.notes,

                            recordedAt:
                                latestHealth.createdAt

                        }
                        : null

                });

            }


            await logReportAccess(
                req,
                "Animal Health"
            );


            return res.status(200).json({

                success: true,

                message:
                    "Animal health report fetched successfully",

                count:
                    report.length,

                data:
                    report

            });

        }

        catch (error) {

            console.error(
                "Animal health report error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate animal health report",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// 3. INJECTION REPORT
// =====================================================
//
// GET /api/reports/injections
//
// =====================================================

router.get(
    "/injections",
    protect,
    async (req, res) => {

        try {

            const animalIds =
                await getAccessibleAnimalIds(
                    req
                );


            const injections =
                await Injection.find({

                    animalId: {
                        $in: animalIds
                    }

                })
                .populate(
                    "animalId",
                    "name animalTagId breed"
                )
                .sort({
                    nextDueDate: 1
                });


            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );


            const report =
                injections.map(
                    injection => ({

                        injectionId:
                            injection._id,

                        animalId:
                            injection.animalId?._id,

                        animalName:
                            injection.animalId?.name ||
                            "Unknown",

                        animalTagId:
                            injection.animalId?.animalTagId ||
                            "N/A",

                        breed:
                            injection.animalId?.breed ||
                            "N/A",

                        injectionName:
                            injection.injectionName,

                        dateGiven:
                            injection.dateGiven,

                        nextDueDate:
                            injection.nextDueDate,

                        veterinarianName:
                            injection.veterinarianName,

                        dosage:
                            injection.dosage,

                        notes:
                            injection.notes,

                        completed:
                            injection.completed,

                        overdue:
                            !injection.completed &&
                            new Date(
                                injection.nextDueDate
                            ) < today

                    })
                );


            await logReportAccess(
                req,
                "Injection"
            );


            return res.status(200).json({

                success: true,

                message:
                    "Injection report fetched successfully",

                count:
                    report.length,

                data:
                    report

            });

        }

        catch (error) {

            console.error(
                "Injection report error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate injection report",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// 4. MILK PRODUCTION REPORT
// =====================================================
//
// GET /api/reports/milk-production
//
// =====================================================

router.get(
    "/milk-production",
    protect,
    async (req, res) => {

        try {

            const animalIds =
                await getAccessibleAnimalIds(
                    req
                );


            const animals =
                await Animal.find({

                    _id: {
                        $in: animalIds
                    }

                })
                .populate(
                    "farmId",
                    "farmName"
                )
                .sort({
                    milkProduction: -1
                });


            const report =
                animals.map(
                    animal => ({

                        animalId:
                            animal._id,

                        animalTagId:
                            animal.animalTagId,

                        animalName:
                            animal.name,

                        breed:
                            animal.breed,

                        farmName:
                            animal.farmId?.farmName ||
                            "N/A",

                        milkProduction:
                            Number(
                                animal.milkProduction
                            ) || 0

                    })
                );


            const totalMilk =
                report.reduce(
                    (
                        total,
                        animal
                    ) =>
                        total +
                        animal.milkProduction,
                    0
                );


            const averageMilk =
                report.length > 0
                    ? totalMilk /
                      report.length
                    : 0;


            await logReportAccess(
                req,
                "Milk Production"
            );


            return res.status(200).json({

                success: true,

                message:
                    "Milk production report fetched successfully",

                count:
                    report.length,

                summary: {

                    totalMilkProduction:
                        totalMilk,

                    averageMilkProduction:
                        Number(
                            averageMilk.toFixed(
                                2
                            )
                        )

                },

                data:
                    report

            });

        }

        catch (error) {

            console.error(
                "Milk production report error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate milk production report",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// 5. DIET PLAN REPORT
// =====================================================
//
// GET /api/reports/diet-plans
//
// =====================================================

router.get(
    "/diet-plans",
    protect,
    async (req, res) => {

        try {

            const animalIds =
                await getAccessibleAnimalIds(
                    req
                );


            const dietPlans =
                await DietPlan.find({

                    animalId: {
                        $in: animalIds
                    }

                })
                .populate(
                    "animalId",
                    "name animalTagId breed"
                )
                .sort({
                    startDate: -1
                });


            const report =
                dietPlans.map(
                    plan => ({

                        dietPlanId:
                            plan._id,

                        animalId:
                            plan.animalId?._id,

                        animalName:
                            plan.animalId?.name ||
                            "Unknown",

                        animalTagId:
                            plan.animalId?.animalTagId ||
                            "N/A",

                        breed:
                            plan.animalId?.breed ||
                            "N/A",

                        feedName:
                            plan.feedName,

                        quantity:
                            plan.quantity,

                        feedingTime:
                            plan.feedingTime,

                        nutritionalNotes:
                            plan.nutritionalNotes,

                        startDate:
                            plan.startDate,

                        endDate:
                            plan.endDate,

                        status:
                            plan.status

                    })
                );


            await logReportAccess(
                req,
                "Diet Plans"
            );


            return res.status(200).json({

                success: true,

                message:
                    "Diet plan report fetched successfully",

                count:
                    report.length,

                data:
                    report

            });

        }

        catch (error) {

            console.error(
                "Diet plan report error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate diet plan report",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// 6. HEALTH RECORD REPORT
// =====================================================
//
// GET /api/reports/health-records
//
// =====================================================

router.get(
    "/health-records",
    protect,
    async (req, res) => {

        try {

            const animalIds =
                await getAccessibleAnimalIds(
                    req
                );


            const healthRecords =
                await HealthRecord.find({

                    animalId: {
                        $in: animalIds
                    }

                })
                .populate(
                    "animalId",
                    "name animalTagId breed"
                )
                .sort({
                    createdAt: -1
                });


            const report =
                healthRecords.map(
                    record => ({

                        healthRecordId:
                            record._id,

                        animalId:
                            record.animalId?._id,

                        animalName:
                            record.animalId?.name ||
                            "Unknown",

                        animalTagId:
                            record.animalId?.animalTagId ||
                            "N/A",

                        breed:
                            record.animalId?.breed ||
                            "N/A",

                        temperature:
                            record.temperature,

                        appetite:
                            record.appetite,

                        activityLevel:
                            record.activityLevel,

                        milkProduction:
                            record.milkProduction,

                        symptoms:
                            record.symptoms,

                        notes:
                            record.notes,

                        recordedAt:
                            record.createdAt,

                        updatedAt:
                            record.updatedAt

                    })
                );


            await logReportAccess(
                req,
                "Health Records"
            );


            return res.status(200).json({

                success: true,

                message:
                    "Health records report fetched successfully",

                count:
                    report.length,

                data:
                    report

            });

        }

        catch (error) {

            console.error(
                "Health records report error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate health records report",

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