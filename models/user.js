const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    last_name: { type: String, required: true, maxLength: 100 },
});
// Virtual for author's full name
UserSchema.virtual("name").get(function () {
    // To avoid errors in cases where an author does not have either a family name or a first name
    // We want to make sure we handle the exception by returning an empty string for that case
    return `${this.first_name} ${this.last_name}`;
});

// Virtual for book's URL
UserSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the 'this' object
    return `/users/${this._id}`;
});

// Export model
module.exports = mongoose.model("User", UserSchema);