const express = require("express");
const mongoose = require("mongoose");

const Animal = require("../models/Animal");
const Farm = require("../models/Farm");

const protect = require("../middleware/authMiddleware");

const createAuditLog = require("../services/auditLogService");

const validateAnimal = require("../validators/animalValidator");

const router = express.Router();


// ======================================================
// ANIMAL ACCESS CONTROL
// ======================================================
//
// Admin
//      → Can access any animal
//
// Veterinarian
//      → Can view any animal
//
// Farmer
//      → Can access only animals belonging to their farms
//
// ======================================================

async function checkAnimalAccess(animalId, req) {

  try {

    // --------------------------------------------------
    // Validate ObjectId
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(animalId)) {

      return {
        allowed: false,
        status: 400,
        message: "Invalid animal ID"
      };

    }


    // --------------------------------------------------
    // Find animal
    // --------------------------------------------------

    const animal =
      await Animal.findById(animalId);


    if (!animal) {

      return {
        allowed: false,
        status: 404,
        message: "Animal not found"
      };

    }


    // --------------------------------------------------
    // ADMIN
    // --------------------------------------------------

    if (req.user.role === "admin") {

      return {
        allowed: true,
        animal
      };

    }


    // --------------------------------------------------
    // VETERINARIAN
    // --------------------------------------------------

    if (req.user.role === "veterinarian") {

      return {
        allowed: true,
        animal
      };

    }


    // --------------------------------------------------
    // FARMER
    // --------------------------------------------------

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


    // --------------------------------------------------
    // ACCESS GRANTED
    // --------------------------------------------------

    return {

      allowed: true,

      animal,

      farm

    };

  }

  catch (error) {

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


// ======================================================
// AUDIT UNAUTHORIZED ACCESS
// ======================================================

async function logUnauthorizedAccess(
  req,
  action,
  description
) {

  try {

    await createAuditLog({

      userId:
        req.user?.userId || null,

      action,

      module: "ANIMAL",

      description,

      ipAddress:
        req.ip

    });

  }

  catch (error) {

    console.error(
      "Security audit log error:",
      error
    );

  }

}


// ======================================================
// CREATE ANIMAL
//
// POST /api/animals
//
// Farmer → Own farm
// Admin  → Any farm
// ======================================================

router.post(
  "/",
  protect,
  validateAnimal,
  async (req, res) => {

    try {

      const {

        animalTagId,
        name,
        breed,
        gender,
        dateOfBirth,
        weight,
        milkProduction,
        pregnancyStatus,
        farmId

      } = req.body;


      // --------------------------------------------------
      // FARM ID REQUIRED
      // --------------------------------------------------

      if (!farmId) {

        return res.status(400).json({

          success: false,

          message:
            "Farm ID is required"

        });

      }


      // --------------------------------------------------
      // VALIDATE FARM ID
      // --------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          farmId
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid farm ID"

        });

      }


      // --------------------------------------------------
      // CHECK FARM ACCESS
      // --------------------------------------------------

      let farm;


      if (req.user.role === "admin") {

        farm =
          await Farm.findById(
            farmId
          );

      }

      else {

        farm =
          await Farm.findOne({

            _id: farmId,

            ownerId:
              req.user.userId

          });

      }


      if (!farm) {

        await logUnauthorizedAccess(

          req,

          "UNAUTHORIZED_CREATE",

          `Unauthorized attempt to create animal for farm ${farmId}`

        );


        return res.status(403).json({

          success: false,

          message:
            "Farm not found or you do not have access to this farm"

        });

      }


      // --------------------------------------------------
      // CHECK DUPLICATE ANIMAL TAG
      // --------------------------------------------------

      if (animalTagId) {

        const existingAnimal =
          await Animal.findOne({

            animalTagId,

            farmId

          });


        if (existingAnimal) {

          return res.status(409).json({

            success: false,

            message:
              "Animal with this tag ID already exists in this farm"

          });

        }

      }


      // --------------------------------------------------
      // CREATE ANIMAL
      // --------------------------------------------------

      const animal =
        await Animal.create({

          animalTagId,

          name,

          breed,

          gender,

          dateOfBirth,

          weight,

          milkProduction,

          pregnancyStatus:
            pregnancyStatus || false,

          farmId

        });


      // --------------------------------------------------
      // AUDIT LOG
      // --------------------------------------------------

      await createAuditLog({

        userId:
          req.user.userId,

        action: "CREATE",

        module: "ANIMAL",

        description:
          `Created animal: ${
            animal.name ||
            animal.animalTagId
          }`,

        ipAddress:
          req.ip

      });


      return res.status(201).json({

        success: true,

        message:
          "Animal created successfully",

        animal

      });

    }

    catch (error) {

      console.error(
        "Animal creation error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Animal creation failed"

      });

    }

  }
);


// ======================================================
// GET ALL ANIMALS
//
// GET /api/animals
//
// Farmer       → Own animals
// Veterinarian → All animals
// Admin        → All animals
// ======================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      let animals = [];

      let totalFarms = 0;


      // --------------------------------------------------
      // ADMIN
      // --------------------------------------------------

      if (
        req.user.role === "admin"
      ) {

        animals =
          await Animal.find()

            .populate(
              "farmId",
              "farmName location"
            )

            .sort({
              createdAt: -1
            });


        totalFarms =
          await Farm.countDocuments();

      }


      // --------------------------------------------------
      // VETERINARIAN
      // --------------------------------------------------

      else if (
        req.user.role === "veterinarian"
      ) {

        animals =
          await Animal.find()

            .populate(
              "farmId",
              "farmName location"
            )

            .sort({
              createdAt: -1
            });


        totalFarms =
          await Farm.countDocuments();

      }


      // --------------------------------------------------
      // FARMER
      // --------------------------------------------------

      else {

        const farms =
          await Farm.find({

            ownerId:
              req.user.userId

          }).select("_id");


        totalFarms =
          farms.length;


        const farmIds =
          farms.map(
            farm => farm._id
          );


        animals =
          await Animal.find({

            farmId: {
              $in: farmIds
            }

          })

            .populate(
              "farmId",
              "farmName location"
            )

            .sort({
              createdAt: -1
            });

      }


      return res.status(200).json({

        success: true,

        message:
          "Animals fetched successfully",

        totalFarms,

        totalAnimals:
          animals.length,

        animals

      });

    }

    catch (error) {

      console.error(
        "Fetch animals error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch animals"

      });

    }

  }
);


// ======================================================
// SEARCH / FILTER ANIMALS
//
// GET /api/animals/search?name=Lucy
// GET /api/animals/search?breed=Holstein
// GET /api/animals/search?gender=female
// GET /api/animals/search?pregnancyStatus=true
// GET /api/animals/search?farmId=...
// ======================================================

router.get(
  "/search",
  protect,
  async (req, res) => {

    try {

      const {

        name,
        breed,
        gender,
        pregnancyStatus,
        farmId

      } = req.query;


      const query = {};


      // --------------------------------------------------
      // NAME
      // --------------------------------------------------

      if (name) {

        query.name = {

          $regex:
            name,

          $options:
            "i"

        };

      }


      // --------------------------------------------------
      // BREED
      // --------------------------------------------------

      if (breed) {

        query.breed = {

          $regex:
            breed,

          $options:
            "i"

        };

      }


      // --------------------------------------------------
      // GENDER
      // --------------------------------------------------

      if (gender) {

        if (
          ![
            "male",
            "female"
          ].includes(gender)
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Invalid gender"

          });

        }


        query.gender =
          gender;

      }


      // --------------------------------------------------
      // PREGNANCY STATUS
      // --------------------------------------------------

      if (
        pregnancyStatus !== undefined
      ) {

        if (
          ![
            "true",
            "false"
          ].includes(
            pregnancyStatus
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Invalid pregnancyStatus"

          });

        }


        query.pregnancyStatus =
          pregnancyStatus === "true";

      }


      // --------------------------------------------------
      // FARM ID
      // --------------------------------------------------

      if (farmId) {

        if (
          !mongoose.Types.ObjectId.isValid(
            farmId
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Invalid farm ID"

          });

        }

        query.farmId =
          farmId;

      }


      // --------------------------------------------------
      // FARMER OWNERSHIP
      // --------------------------------------------------

      if (
        req.user.role !== "admin" &&
        req.user.role !== "veterinarian"
      ) {

        const farms =
          await Farm.find({

            ownerId:
              req.user.userId

          }).select("_id");


        const farmIds =
          farms.map(
            farm => farm._id
          );


        query.farmId = {

          $in:
            farmIds

        };

      }


      // --------------------------------------------------
      // SEARCH
      // --------------------------------------------------

      const animals =
        await Animal.find(
          query
        )

          .populate(
            "farmId",
            "farmName location"
          )

          .sort({
            createdAt: -1
          });


      return res.status(200).json({

        success: true,

        message:
          "Animals searched successfully",

        totalAnimals:
          animals.length,

        animals

      });

    }

    catch (error) {

      console.error(
        "Animal search error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to search animals"

      });

    }

  }
);


// ======================================================
// GET SINGLE ANIMAL
//
// GET /api/animals/:id
// ======================================================

router.get(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;


      // --------------------------------------------------
      // CHECK ACCESS
      // --------------------------------------------------

      const access =
        await checkAnimalAccess(
          id,
          req
        );


      if (!access.allowed) {

        await logUnauthorizedAccess(

          req,

          "UNAUTHORIZED_READ",

          `Unauthorized attempt to access animal ${id}`

        );


        return res.status(
          access.status
        ).json({

          success: false,

          message:
            access.message

        });

      }


      // --------------------------------------------------
      // POPULATE FARM
      // --------------------------------------------------

      const animal =
        await Animal.findById(
          id
        ).populate(
          "farmId",
          "farmName location address"
        );


      return res.status(200).json({

        success: true,

        message:
          "Animal fetched successfully",

        animal

      });

    }

    catch (error) {

      console.error(
        "Fetch animal error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch animal"

      });

    }

  }
);


// ======================================================
// UPDATE ANIMAL
//
// PUT /api/animals/:id
//
// Farmer → Own animal
// Admin  → Any animal
// Veterinarian → Not allowed
// ======================================================

router.put(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;


      // --------------------------------------------------
      // CHECK ACCESS
      // --------------------------------------------------

      const access =
        await checkAnimalAccess(
          id,
          req
        );


      if (!access.allowed) {

        await logUnauthorizedAccess(

          req,

          "UNAUTHORIZED_UPDATE",

          `Unauthorized attempt to update animal ${id}`

        );


        return res.status(
          access.status
        ).json({

          success: false,

          message:
            access.message

        });

      }


      // --------------------------------------------------
      // VETERINARIAN CANNOT UPDATE
      // --------------------------------------------------

      if (
        req.user.role === "veterinarian"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Veterinarians cannot update animals"

        });

      }


      const animal =
        access.animal;


      // --------------------------------------------------
      // UPDATE DATA
      // --------------------------------------------------

      const {

        animalTagId,
        name,
        breed,
        gender,
        dateOfBirth,
        weight,
        milkProduction,
        pregnancyStatus,
        farmId

      } = req.body;


      // --------------------------------------------------
      // VALIDATE NEW FARM
      // --------------------------------------------------

      if (
        farmId &&
        farmId.toString() !==
        animal.farmId.toString()
      ) {

        let newFarm;


        if (
          req.user.role === "admin"
        ) {

          newFarm =
            await Farm.findById(
              farmId
            );

        }

        else {

          newFarm =
            await Farm.findOne({

              _id:
                farmId,

              ownerId:
                req.user.userId

            });

        }


        if (!newFarm) {

          await logUnauthorizedAccess(

            req,

            "UNAUTHORIZED_FARM_CHANGE",

            `Attempted to move animal ${id} to unauthorized farm ${farmId}`

          );


          return res.status(403).json({

            success: false,

            message:
              "New farm not found or you do not have access to it"

          });

        }


        animal.farmId =
          farmId;

      }


      // --------------------------------------------------
      // DUPLICATE TAG CHECK
      // --------------------------------------------------

      if (
        animalTagId &&
        animalTagId !==
          animal.animalTagId
      ) {

        const duplicate =
          await Animal.findOne({

            animalTagId,

            farmId:
              animal.farmId,

            _id: {
              $ne: animal._id
            }

          });


        if (duplicate) {

          return res.status(409).json({

            success: false,

            message:
              "Another animal with this tag ID already exists in this farm"

          });

        }

      }


      // --------------------------------------------------
      // UPDATE FIELDS
      // --------------------------------------------------

      if (
        animalTagId !== undefined
      ) {

        animal.animalTagId =
          animalTagId;

      }


      if (
        name !== undefined
      ) {

        animal.name =
          name;

      }


      if (
        breed !== undefined
      ) {

        animal.breed =
          breed;

      }


      if (
        gender !== undefined
      ) {

        if (
          ![
            "male",
            "female"
          ].includes(gender)
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Invalid gender"

          });

        }


        animal.gender =
          gender;

      }


      if (
        dateOfBirth !== undefined
      ) {

        animal.dateOfBirth =
          dateOfBirth;

      }


      if (
        weight !== undefined
      ) {

        animal.weight =
          weight;

      }


      if (
        milkProduction !== undefined
      ) {

        animal.milkProduction =
          milkProduction;

      }


      if (
        pregnancyStatus !== undefined
      ) {

        animal.pregnancyStatus =
          pregnancyStatus;

      }


      // --------------------------------------------------
      // SAVE
      // --------------------------------------------------

      await animal.save();


      // --------------------------------------------------
      // AUDIT LOG
      // --------------------------------------------------

      await createAuditLog({

        userId:
          req.user.userId,

        action:
          "UPDATE",

        module:
          "ANIMAL",

        description:
          `Updated animal: ${
            animal.name ||
            animal.animalTagId
          }`,

        ipAddress:
          req.ip

      });


      return res.status(200).json({

        success: true,

        message:
          "Animal updated successfully",

        animal

      });

    }

    catch (error) {

      console.error(
        "Animal update error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update animal"

      });

    }

  }
);


// ======================================================
// DELETE ANIMAL
//
// DELETE /api/animals/:id
//
// Farmer → Own animal
// Admin  → Any animal
// Veterinarian → Not allowed
// ======================================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;


      // --------------------------------------------------
      // CHECK ACCESS
      // --------------------------------------------------

      const access =
        await checkAnimalAccess(
          id,
          req
        );


      if (!access.allowed) {

        await logUnauthorizedAccess(

          req,

          "UNAUTHORIZED_DELETE",

          `Unauthorized attempt to delete animal ${id}`

        );


        return res.status(
          access.status
        ).json({

          success: false,

          message:
            access.message

        });

      }


      // --------------------------------------------------
      // VETERINARIAN CANNOT DELETE
      // --------------------------------------------------

      if (
        req.user.role === "veterinarian"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Veterinarians cannot delete animals"

        });

      }


      const animal =
        access.animal;


      // --------------------------------------------------
      // DELETE
      // --------------------------------------------------

      await Animal.findByIdAndDelete(
        id
      );


      // --------------------------------------------------
      // AUDIT LOG
      // --------------------------------------------------

      await createAuditLog({

        userId:
          req.user.userId,

        action:
          "DELETE",

        module:
          "ANIMAL",

        description:
          `Deleted animal: ${
            animal.name ||
            animal.animalTagId
          }`,

        ipAddress:
          req.ip

      });


      return res.status(200).json({

        success: true,

        message:
          "Animal deleted successfully"

      });

    }

    catch (error) {

      console.error(
        "Animal delete error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to delete animal"

      });

    }

  }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;