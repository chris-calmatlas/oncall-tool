const Schedule = require("../models/schedule");
const User = require("../models/user");

const async = require("async");
const { body, validationResult } = require("express-validator");

// Display the schedules
exports.index = (req, res) => {
  Schedule.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_schedules) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("schedules", {
        title: "Schedule List",
        schedule_list: list_schedules,
      });
    });
};

// Display schedule create form on GET.
exports.schedule_create_get = (req, res) => {
  async.parallel(
    {
      users(callback) {
        User.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("schedule_form", {
        title: "Add Schedule",
        users: results.users,
      });
    }
  );
};

// Handle schedule create on POST.
exports.schedule_create_post = [
  // Validate and sanitize fileds.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name must be specified")
    .isAlphanumeric('en-US', {ignore: ' '})
    .withMessage("Name has non-alphanumeric characters."),
  body("user.*").escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an schedule object with escaped and trimmed data
    const schedule = new Schedule({
      name: req.body.name,
      members: req.body.user
    });

    if(!errors.isEmpty()){
      async.parallel(
        {
          users(callback) {
            User.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          // Mark our selected users as checked.
          for (const user of results.users) {
            if (schedule.members.includes(user._id)) {
              user.checked = "true";
            }
          }
          // Render
          res.render("schedule_form", {
            title: "Add Schedule",
            users: results.users,
            schedule,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from the form is valid. Save the schedule
    schedule.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new schedule record.
      res.redirect(schedule.url);
    });
  },
];

// Display detail page for a specific schedule.
exports.schedule_detail = (req, res, next) => {
  async.parallel(
    {
      schedule(callback) {
        Schedule.findById(req.params.id)
        .populate("members")
        .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.schedule == null) {
        // No results.
        const err= new Error("Schedule not found");
        err.status = 404;
        return next(err);
      }

      //Successful, so render
      res.render("schedule_detail", {
        title: results.schedule.title,
        schedule: results.schedule,
      });
    }
  )
};

// Display schedule delete form on GET.
exports.schedule_delete_get = (req, res, next) => {
  async.parallel(
    {
      schedule(callback) {
        Schedule.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.schedule == null) {
        // No results.
        res.redirect("/schedules");
      }
      // Successful, so render.
      res.render("schedule_delete", {
        title: "Delete Schedule",
        schedule: results.schedule,
      });
    }
  );
};

// Handle schedule delete on POST.
exports.schedule_delete_post = (req, res, next) => {
  async.parallel(
    {
      schedule(callback) {
        Schedule.findById(req.body.scheduleid).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      Schedule.findByIdAndRemove(req.body.scheduleid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to schedule list
        res.redirect("/schedules");
      });
    }
  );
};

// Display schedule update form on GET.
exports.schedule_update_get = (req, res, next) => {
  // Get schedule
  async.parallel(
    {
      schedule(callback){
        Schedule.findById(req.params.id).exec(callback);
      },
      users(callback) {
        User.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.schedule == null) {
          // No results
          const err = new Error("Schedule not found");
          err.status = 404;
          return next(err);
      }
      // Success
      // Mark our selected users as checked.
      for (const user of results.users){
        for (const scheduleMember of results.schedule.members) {
          if(user._id.toString() === scheduleMember._id.toString()) {
            user.checked = "true";
          }
        }
      }
      // Render
      res.render("schedule_form", { 
        title: "Update Schedule",
        schedule: results.schedule,
        users: results.users,
      });
    }
  );
};
  
// Handle schedule update on POST.
exports.schedule_update_post = [
  // Validate and sanitize fileds.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name must be specified")
    .isAlphanumeric('en-US', {ignore: ' '})
    .withMessage("Name has non-alphanumeric characters."),
  body("user.*").escape(),
  
  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an schedule object with escaped and trimmed data and old id.
    const schedule = new Schedule({
      name: req.body.name,
      members: req.body.user,
      _id: req.params.id,
    });
    
    if(!errors.isEmpty()){
      //There are errors. Render form again with sanitized values/error messages.
      async.parallel(
        {
          users(callback) {
            User.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          // Mark selected users as checked
          for (const user of results.users){
            if (schedule.members.includes(user._id)) {
              user.checked = "true";
            }
          }
          // Render
          res.render("schedule_form", {
            title: "Update Schedule",
            users: results.users,
            schedule,
            errors: errors.array()
          });
        }
      );
      return;
    }

    // Data from form is valid
    Schedule.findByIdAndUpdate(req.params.id, schedule, {}, (err, newSchedule) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to schedule record.
      res.redirect(newSchedule.url);
    });
  },
];
