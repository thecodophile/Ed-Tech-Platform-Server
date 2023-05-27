// Import the required modules
const router = require("express").Router();

const {
  capturePayment,
  verifySignature,
} = require("../controllers/PaymentsController");
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/authMiddleware");
router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifySignature", verifySignature);

module.exports = router;
