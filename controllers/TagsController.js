const Tag = require("../models/Tag");

// createTag
exports.createTag = async (req, res) => {
  try {
    // fetch data from request body
    const { name, description } = req.body;

    // data validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // create entry in DB
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });
    console.log("Tag Details: ", tagDetails);

    // return response
    return res.status(200).json({
      success: true,
      message: "Tag created Successfully",
    });
  } catch (error) {
    console.log("Error occured while creating tag: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// getAllTags
exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true });
    res.status(200).json({
      success: true,
      message: "All Tags returned successfully",
      allTags,
    });
  } catch (error) {
    console.log("Error occured while returning all tags: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
