const router = require("express").Router();
const { auth } = require("../middlewares/authMiddleware");
const {
  deleteAccount,
  updateProfile,
  getUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
} = require("../controllers/ProfileController");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delete User Account
router.delete("/deleteProfile", auth, deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getUserDetails);
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

module.exports = router;
