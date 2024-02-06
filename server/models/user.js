const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  calendarId: {
    type: String,
    required: false
  },
  calendarLink: {
    type: String  // Add this field for storing the generated link
  }
});

// Create a User model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
