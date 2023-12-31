const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    user: [{ type: Schema.Types.ObjectId, ref: "User"}],
    members: [{ type: Schema.Types.ObjectId, ref: "User"}],
    owner: { type: Schema.Types.ObjectId, ref: "User"},
});

// Virtual for schedule's URL
ScheduleSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the 'this' object
    return `/schedules/${this._id}`;
});

// Export model
module.exports = mongoose.model("Schedule", ScheduleSchema);