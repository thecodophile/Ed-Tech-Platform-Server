const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

//createSubsection
exports.createSubSection = async (req, res) => {
  try {
    // fetch data from request body
    const { sectionId, title, description } = req.body;

    // extract file/video
    const video = req.files.videoFile;

    // validation
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //upload video to cloudinary
    // ToDo: change ImageUploader utility fun name as this fun is not only can upload image file, it can upload any type of file
    console.log("Going to add video file");
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // create sub-section
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
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
    ).populate("subSection");

    //retrun response
    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successfully",
      data: updatedSection,
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
    const { subSectionId, title, description } = req.body;
    const subSection = await SubSection.findById(subSectionId);

    // data validation
    if (!subSectionId) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }

    //upload video to cloudinary
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

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
    // get ID
    const { subSectionId, sectionId } = req.body;

    // pull from section
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );

    // delete entry
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

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
