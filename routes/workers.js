var express = require('express');
var router = express.Router();

// Require controller modules.
const worker_controller = require("../controllers/workerController");

/// WORKER ROUTES ///

// GET worker home page.
router.get("/", worker_controller.index);

// GET request for creating a Worker. NOTE This must come before routes that display Worker (uses id).
router.get("/add", worker_controller.worker_create_get);

// POST request for creating Worker.
router.post("/add", worker_controller.worker_create_post);

// GET request for one Worker.
router.get("/:id", worker_controller.worker_detail);

// GET request to delete Worker.
router.get("/:id/delete", worker_controller.worker_delete_get);

// POST request to delete Worker.
router.post("/:id/delete", worker_controller.worker_delete_post);

// GET request to update Worker.
router.get("/:id/update", worker_controller.worker_update_get);

// POST request to update Worker.
router.post("/:id/update", worker_controller.worker_update_post);




module.exports = router;
