const express = require("express");
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
} = require("../controllers/tourController");
const formatQuery = require("../middlewares/formatQuery");

const router = express.Router();

router.route("/api/top-tours").get(aliasTopTours, getAllTours);

router.route("/api/tours").get(formatQuery, getAllTours).post(createTour);

router
  .route("/api/tours/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
