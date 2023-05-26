const { default: mongoose } = require("mongoose");
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
// TODO : import course enrollment email template here

// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  try {
    // get courseId and userId
    const { course_id } = req.body;
    const userId = req.user.id;

    // validation
    //valid courseId or not
    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid course ID",
      });
    }

    // valid courseDetails or not
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Could not find the course",
        });
      }

      // user already pay for the same course or not
      const user_id = new mongoose.Types.ObjectId(userId); //userId got which is in string form, convert to object Id to work with DB details
      if (course.studentsEnrolled.includes(user_id)) {
        return res.status(400).json({
          success: false,
          message: "Student is already enrolled",
        });
      }
    } catch (error) {
      console.error(
        "Error occured while verifying the course details and user when initiate the Razorpay order: ",
        error
      );
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // create order
    const amount = course.price;
    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: course_id,
        userId,
      },
    };

    try {
      // initiate the payment using razorpay
      const paymentResponse = await instance.orders.create(options);
      console.log("Payment Response: ", paymentResponse);

      // return response
      return res.status(200).json({
        success: true,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.log("Error occured whline initaite order: ", error);
      return res.status(400).json({
        success: false,
        message: "Could not initiate order",
      });
    }
  } catch (error) {
    console.error("Error in capture payment controller: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// verify Signature of Razorpay and Server
exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";

  const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature === digest) {
    console.log("Payment is Authorised");

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      // fulfill the action
      // find the course and enrolled the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        {
          $push: {
            studentsEnrolled: userId,
          },
        },
        { new: true }
      );
      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not Found",
        });
      }

      console.log("Enrolled Course: ", enrolledCourse);

      //    find the student  and add the course to their list of enrolled courses
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );

      console.log("Enrolled Student: ", enrolledStudent);

      //   send confirmation mail to the user
      // Todo:attach email template
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from Codophile",
        "Congratulations, you are onboarded into new Codophile Course"
      );

      console.log("emailResponse: ", emailResponse);

      return res.status(200).json({
        success: true,
        message: "Signature verified and Course Added",
      });
    } catch (error) {
      console.log("Error form verifySignature: ", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid Request",
    });
  }
};
