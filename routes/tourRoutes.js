const express = require("express");
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require("../controllers/tourController");
const formatQuery = require("../middlewares/formatQuery");
const { protect, restrictTo } = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.route("/api/top-tours").get(protect, aliasTopTours, getAllTours);

router
  .route("/api/tour-stats")
  .get(protect, restrictTo("admin"), getTourStats);

router
  .route("/api/monthly-plan/:year")
  .get(protect, restrictTo("admin"), getMonthlyPlan);

router
  .route("/api/tours")
  .get(formatQuery, getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);

router
  .route("/api/tours/:id")
  .get(getTour)
  .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protect, restrictTo("guide", "admin", "lead-guide"), deleteTour);

router
  .route("/api/tours/:tourId/reviews")
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

module.exports = router;
