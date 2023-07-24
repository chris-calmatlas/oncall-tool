const User = require("../models/user");
const Schedule = require("../models/schedule");

const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all users.
exports.index = (req, res) => {
  User.find()
    .sort([["family_name", "ascending"]])
    .exec(function (err, list_users) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("users", {
        title: "User List",
        user_list: list_users,
      });
    });
};

// Display user create form on GET.
exports.user_create_get = (req, res) => {
  res.render("user_form", { title: "Add User" });
};

// Handle user create on POST.
exports.user_create_post = [
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
      res.render("user_form", {
        title: "Add User",
        user: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid
    // Create an user object with escaped and trimmed data
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    });
    user.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new user record.
      res.redirect(user.url);
    });
  },
];

// Display detail page for a specific user.
exports.user_detail = (req, res, next) => {
  async.parallel(
    {
      user(callback) {
        User.findById(req.params.id).exec(callback);
      },
      schedule_assigned(callback) {
        Schedule.find({ user: req.params.id }, "name").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.user == null) {
        // No results.
        const err= new Error("User not found");
        err.status = 404;
        return next(err);
      }
      //Successful, so render
      res.render("user_detail", {
        title: results.user.title,
        user: results.user,
        schedules: results.schedule_assigned,
      });
    }
  )
};

// Display user delete form on GET.
exports.user_delete_get = (req, res, next) => {
  async.parallel(
    {
      user(callback) {
        User.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.user == null) {
        // No results.
        res.redirect("/users");
      }
      // Successful, so render.
      res.render("user_delete", {
        title: "Delete User",
        user: results.user,
      });
    }
  );
};

// Handle user delete on POST.
exports.user_delete_post = (req, res, next) => {
  async.parallel(
    {
      user(callback) {
        User.findById(req.body.userid).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      User.findByIdAndRemove(req.body.userid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to user list
        res.redirect("/users");
      });
    }
  );
};

// Display user update form on GET.
exports.user_update_get = (req, res, next) => {
  // Get user
  async.parallel(
    {
      user(callback){
        User.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.user == null) {
          // No results
          const err = new Error("User not found");
          err.status = 404;
          return next(err);
      }
      // Success
      res.render("user_form", { 
        title: "Update User",
        user: results.user,
      });
    }
  );
};
  
// Handle user update on POST.
exports.user_update_post = [
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
      res.render("user_form", {
        title: "Update User",
        user: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid
    // Create an user object with escaped and trimmed data and old id.
    const updateUser = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      _id: req.params.id,
    });
    User.findByIdAndUpdate(req.params.id, updateUser, {}, (err, user) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to user record.
      res.redirect(user.url);
    });
  },
];
