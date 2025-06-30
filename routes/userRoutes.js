const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.post("/signup", authController.signUp);

router.post("/signin", authController.signIn);

router.post("/signout", authController.signOut);

router.post("/forgot-password", authController.forgotPassword);

router.patch("/reset-password/:token", authController.resetPassword);

router.put("/change-password", protect, authController.changePassword);

module.exports = router;
