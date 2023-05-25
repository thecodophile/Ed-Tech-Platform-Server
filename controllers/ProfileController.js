const Profile = require("../models/Profile");
const User = require("../models/User");

// updateProfile
exports.updateProfile = async (req, res) => {
  try {
    // fetch data from request body
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    // fetch userId
    const id = req.user.id;

    // validation
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // find Profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;

    const profileDetails = await Profile.findById(profileId);

    // update profile details
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();

    // retrun response
    return res.status(200).json({
      success: true,
      message: "Profile Upload Successfully",
      profileDetails,
    });
  } catch (error) {
    console.log("Error occured while update Profile: ", error);
    return res.status(500).json({
      success: false,
      message: "Update profile failed",
      error: error.message,
    });
  }
};

//deleteAccount
exports.deleteAccount = async (req, res) => {
  try {
    // fetch Id
    const id = req.user.id;

    // validation
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // delete Profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    // Todo: unroll user from all enrolled courses

    // delete user
    await User.findByIdAndDelete({ _id: id });

    // return response
    return res.status(200).json({
      success: true,
      message: "User Account Deleted Successfully",
    });
  } catch (error) {
    console.log("Error occured while delete user Account: ", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be deleted successfully",
    });
  }
};

// getUserDetails
exports.getUserDetails = async (req, res) => {
  try {
    // fetch id
    const id = req.user.id;

    // validation and get user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // return response
    return res.status(200).json({
      success: true,
      message: "User Data Fetched Successfully",
      userDetails,
    });
  } catch (error) {
    console.log("Error occured while fetch userDetails: ", error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch User details",
      error: error.message,
    });
  }
};
