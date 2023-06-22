const Worker = require("../models/worker");
const Schedule = require("../models/schedule");

const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all workers.
exports.index = (req, res) => {
  Worker.find()
    .sort([["family_name", "ascending"]])
    .exec(function (err, list_workers) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("workers", {
        title: "Worker List",
        worker_list: list_workers,
      });
    });
};

// Display worker create form on GET.
exports.worker_create_get = (req, res) => {
  res.render("worker_form", { title: "Add Worker" });
};

// Handle worker create on POST.
exports.worker_create_post = [
  // Validate and sanitize fileds.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name must be specified")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters."),
  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      //There are errors. Render form again with sanitized values/error messages.
      res.render("worker_form", {
        title: "Add Worker",
        worker: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid
    // Create an worker object with escaped and trimmed data
    const worker = new Worker({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    });
    worker.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new worker record.
      res.redirect(worker.url);
    });
  },
];

// Display detail page for a specific worker.
exports.worker_detail = (req, res, next) => {
  async.parallel(
    {
      worker(callback) {
        Worker.findById(req.params.id).exec(callback);
      },
      schedule_assigned(callback) {
        Schedule.find({ worker: req.params.id }, "name").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.worker == null) {
        // No results.
        const err= new Error("Worker not found");
        err.status = 404;
        return next(err);
      }
      //Successful, so render
      res.render("worker_detail", {
        title: results.worker.title,
        worker: results.worker,
        schedules: results.schedule_assigned,
      });
    }
  )
};

// Display worker delete form on GET.
exports.worker_delete_get = (req, res, next) => {
  async.parallel(
    {
      worker(callback) {
        Worker.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.worker == null) {
        // No results.
        res.redirect("/workers");
      }
      // Successful, so render.
      res.render("worker_delete", {
        title: "Delete Worker",
        worker: results.worker,
      });
    }
  );
};

// Handle worker delete on POST.
exports.worker_delete_post = (req, res, next) => {
  async.parallel(
    {
      worker(callback) {
        Worker.findById(req.body.workerid).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      Worker.findByIdAndRemove(req.body.workerid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to worker list
        res.redirect("/workers");
      });
    }
  );
};

// Display worker update form on GET.
exports.worker_update_get = (req, res, next) => {
  // Get worker
  async.parallel(
    {
      worker(callback){
        Worker.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.worker == null) {
          // No results
          const err = new Error("Worker not found");
          err.status = 404;
          return next(err);
      }
      // Success
      res.render("worker_form", { 
        title: "Update Worker",
        worker: results.worker,
      });
    }
  );
};
  
// Handle worker update on POST.
exports.worker_update_post = [
  // Validate and sanitize fileds.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name must be specified")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters."),
  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      //There are errors. Render form again with sanitized values/error messages.
      res.render("worker_form", {
        title: "Update Worker",
        worker: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid
    // Create an worker object with escaped and trimmed data and old id.
    const updateWorker = new Worker({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      _id: req.params.id,
    });
    Worker.findByIdAndUpdate(req.params.id, updateWorker, {}, (err, worker) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to worker record.
      res.redirect(worker.url);
    });
  },
];
