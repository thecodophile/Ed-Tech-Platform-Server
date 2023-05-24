const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

//createCourse
exports.createCourse = async (req, res) => {
  try {
    // data fetch from req.body
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    // get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details: ", instructorDetails);
    // TODO: Verify that userId and instructorDetails._id are same or different ?

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details not found",
      });
    }

    // check given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag Details not found",
      });
    }

    // upload image to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create an entry for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //add the new course to the user schema of Instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    //update the Tag Schema
    // TODO

    //return response
    return res.status(200).json({
      success: true,
      message: "Course created Successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log("Error occured while creating Course: ", error);
    return res.status(500).jso({
      success: false,
      message: "Failed to create Course",
      error: error.message,
    });
  }
};

//getAllCourses
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("Instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Data for all courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log("Error occured while fetching all courses data: ", error);
    return res.status(500).jso({
      success: false,
      message: "Cannot fetch course data",
      error: error.message,
    });
  }
};
