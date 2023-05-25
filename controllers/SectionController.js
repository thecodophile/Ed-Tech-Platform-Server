const Section = require("../models/Section");
const Course = require("../models/Course");

//createSection
exports.createSection = async (req, res) => {
  try {
    //fetch data from request body
    const { sectionName, courseId } = req.body;

    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    // create section
    const newSection = await Section.create({ sectionName });

    // update course with section ObjectID
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    );
    // ToDo:use populate to replace section/sub-section both in the updatedCourseDetails

    //return response
    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.log("Error occured while creating Section: ", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create Section, please try again",
      error: error.message,
    });
  }
};

// updateSection
exports.updateSection = async (req, res) => {
  try {
    // fetch data from request body
    const { sectionName, sectionId } = req.body;

    // data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    // update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      section,
    });
  } catch (error) {
    console.log("Error occured while updating Section: ", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update Section, please try again",
      error: error.message,
    });
  }
};

//deleteSection
exports.deleteSection = async (req, res) => {
  try {
    // get ID - assuming that we are sending ID in params
    const { sectionId } = req.params;

    // delete entry
    await Section.findByIdAndDelete(sectionId);
    //TODO[testing]:Do i need to delete the entry from the course schema??

    //return response
    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
    });
  } catch (error) {
    console.log("Error occured while deleting Section: ", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete Section, please try again",
      error: error.message,
    });
  }
};
