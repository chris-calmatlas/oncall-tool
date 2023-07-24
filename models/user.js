const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    last_name: { type: String, required: true, maxLength: 100 },
});

// Virtual for user's full name
UserSchema.virtual("name").get(function () {
    return `${this.first_name} ${this.last_name}`;
});

// Virtual for user's URL
UserSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the 'this' object
    return `/users/${this._id}`;
});

// Export model
module.exports = mongoose.model("User", UserSchema);