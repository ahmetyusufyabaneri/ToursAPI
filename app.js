const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const queryParser = require("./middlewares/queryParser");

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.set("query parser", queryParser);

app.use(tourRouter);

module.exports = app;
