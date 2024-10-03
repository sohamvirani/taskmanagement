const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());


const helmet = require('helmet');


app.use(helmet());


const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const categoryRoutes = require("./routes/categoryRoutes")

app.use("/api/v1", userRoutes);
app.use("/api/v1", taskRoutes);
app.use("/api/v1", categoryRoutes);


// Error Handling middleware

const errormiddleware = require("./middleware/error");

app.use(errormiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
