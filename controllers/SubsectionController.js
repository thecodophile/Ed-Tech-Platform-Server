const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

//createSubsection
exports.createSubSection = async (req, res) => {
  try {
    // fetch data from request body
    const { sectionId, title, timeDuration, description } = req.body;

    // extract file/video
    const video = req.files.videoFile;

    // validation
    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //upload video to cloudinary
    // ToDo: change ImageUploader utility fun name as this fun is not only can upload image file, it can upload any type of file
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // create sub-section
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    // update section with this subsection object Id
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    );
    // Todo: log updated section here, after adding populate quary

    //retrun response
    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successfully",
      updatedSection,
    });
  } catch (error) {
    console.log("Error occured while creating Sub Section: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Sub Section",
      error: error.message,
    });
  }
};

// updateSubSection
exports.updateSubSection = async (req, res) => {
  try {
    // fetch data from request body
    const { subSectionId, title, timeDuration, description } = req.body;

    // extract file/video
    const video = req.files.videoFile;

    // data validation
    if (!subSectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    //upload video to cloudinary
    // ToDo: change ImageUploader utility fun name as this fun is not only can upload image file, it can upload any type of file
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // update data
    const subSection = await SubSection.findByIdAndUpdate(
      subSectionId,
      {
        title,
        timeDuration,
        description,
        videoUrl: uploadDetails.secure_url,
      },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      subSection,
    });
  } catch (error) {
    console.log("Error occured while updating SubSection: ", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update SubSection, please try again",
      error: error.message,
    });
  }
};

// deleteSubSection
exports.deleteSubSection = async (req, res) => {
  try {
    // get ID - assuming that we are sending ID in params
    const { subSectionId } = req.params;

    // delete entry
    await SubSection.findByIdAndDelete(subSectionId);
    //TODO[testing]:Do i need to delete the entry from the Section schema??

    //return response
    return res.status(200).json({
      success: true,
      message: "SubSection Deleted Successfully",
    });
  } catch (error) {
    console.log("Error occured while deleting SubSection: ", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete SubSection, please try again",
      error: error.message,
    });
  }
};
