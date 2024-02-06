const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes/api/users");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// use the cors middleware with the
// origin and credentials options
app.use(cors({ origin: true, credentials: true }));

// use the body-parser middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use the routes module as a middleware
// for the /api/users path
app.use("/api/users", routes);
//show files in uploads folder
app.use('/uploads', express.static('uploads'));
app.use('/calendarFiles', express.static('calendarFiles'));
// Connect Database
connectDB();

app.get("/", (req, res) => res.send("Hello world!"));

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));
