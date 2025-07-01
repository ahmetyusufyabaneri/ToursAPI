const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signUp);

router.post("/signin", authController.signIn);

router.post("/signout", authController.signOut);

router.post("/forgot-password", authController.forgotPassword);

router.patch("/reset-password/:token", authController.resetPassword);

router.put("/change-password", protect, authController.changePassword);

router.patch("/update-account", protect, userController.updateAccount);

router.delete("/delete-account", protect, userController.deleteAccount);

router
  .route("/")
  .get(protect, restrictTo("admin"), userController.getAllUsers)
  .post(protect, restrictTo("admin"), userController.createUser);

router
  .route("/:id")
  .get(protect, restrictTo("admin"), userController.getUser)
  .patch(protect, restrictTo("admin"), userController.updateUser)
  .delete(protect, restrictTo("admin"), userController.deleteUser);

module.exports = router;
