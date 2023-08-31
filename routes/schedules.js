var express = require('express');
var router = express.Router();

// Require controller modules.
const schedule_controller = require("../controllers/scheduleController");

/// SCHEDULE ROUTES ///

// GET schedule home page.
router.get("/", schedule_controller.index);

// GET request for creating a Schedule. NOTE This must come before routes that display Schedule (uses id).
router.get("/add", schedule_controller.schedule_create_get);

// POST request for creating Schedule.
router.post("/add", schedule_controller.schedule_create_post);

// GET request for one Schedule.
router.get("/:id", schedule_controller.schedule_detail);

// GET request to delete Schedule.
router.get("/:id/delete", schedule_controller.schedule_delete_get);

// POST request to delete Schedule.
router.post("/:id/delete", schedule_controller.schedule_delete_post);

// GET request to update Schedule.
router.get("/:id/update", schedule_controller.schedule_update_get);

// POST request to update Schedule.
router.post("/:id/update", schedule_controller.schedule_update_post);

module.exports = router;
