const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const queryParser = require("./middlewares/queryParser");
const cookieParser = require("cookie-parser");

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.set("query parser", queryParser);

app.use(tourRouter);

app.use("/api/users", userRouter);

app.use((err, req, res, next) => {
  console.log(err.stack);

  err.message = err.message || "An error occured";

  res.status(400).json({
    status: "failed",
    message: err.message,
  });
});

module.exports = app;
