const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const queryParser = require("./middlewares/queryParser");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const app = express();

const limiter = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Try again",
});

app.use(express.json());

app.use(helmet());

app.use("/api", limiter);

app.use(morgan("dev"));

app.use(hpp());

app.use(cookieParser());

app.set("query parser", queryParser);

app.use(tourRouter);

app.use("/api/users", userRouter);

app.use("/api/reviews", reviewRouter);

app.use(mongoSanitize());

app.use((err, req, res, next) => {
  console.log(err.stack);

  err.message = err.message || "An error occured";

  res.status(400).json({
    status: "failed",
    message: err.message,
  });
});

module.exports = app;
