const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const salt =10;
// const User = require("../model/user");
const user = require("../model/user");
const dotenv = require("dotenv");
;
dotenv.config();


exports.registerUser = async (req, res) => {

    try {

        const { phoneNumber, pin, country, countryCode, dialCode, userName } = req.body;
        console.log("BODY:", req.body);

        console.log("FILE:", req.file);  

        /* ===============================
           VALIDATION
        =============================== */

        if ( !phoneNumber || !pin || !country || !countryCode || !dialCode || !userName  ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });

        }

        if (pin.length !== 6) {

            return res.status(400).json({
                success: false,
                message: "PIN must be 6 digits."
            });

        }

        /* ===============================
           CHECK PHONE NUMBER
        =============================== */

        const existingPhone = await user.findOne({
            phoneNumber
        });

        if (existingPhone) {

            return res.status(400).json({
                success: false,
                message: "Phone number already exists."
            });

        }

        /* ===============================
           CHECK USERNAME
        =============================== */

        const existingUsername = await user.findOne({
            userName
        });

        if (existingUsername) {

            return res.status(400).json({
                success: false,
                message: "Username already taken."
            });

        }

        /* ===============================
           HASH PIN
        =============================== */

        const hashedPin = await bcrypt.hash(pin, 10);

        /* ===============================
           PROFILE IMAGE
        =============================== */

        let profileImage = "";

        if (req.file) {

            profileImage =
                "/uploads/profile/" + req.file.filename;

        }
        console.log(profileImage);
        if (!profileImage) {
    return res.status(400).json({
        success: false,
        message: "Profile image is required."
    });
}

        /* ===============================
           CREATE USER
        =============================== */
         console.log("About to create user...");
        const newUser = await user.create({
          phoneNumber,
          pin: hashedPin,
          country,
          countryCode,
          dialCode,
          userName,
          profileImage,
          isProfileCompleted: true

        });
        console.log("User created successfully");
        console.log(newUser);

        /* ===============================
           RESPONSE
        =============================== */
console.log("Sending success response...");
        res.status(201).json({

            success: true,

            message: "Registration successful.",
            user: {

                id: newUser._id,

                phoneNumber: newUser.phoneNumber,

                userName: newUser.userName,

                country: newUser.country,

                countryCode: newUser.countryCode,

                dialCode: newUser.dialCode,
                profileImage: newUser.profileImage

            }

        });

    } catch (error) {
  console.error("REGISTER ERROR:");
    console.error(error);

    res.status(500).json({
        success: false,
        message: error.message
    });
;
}
};



// LOGIN USER 
exports.login = async (req, res) => {
    console.log("LOGIN BODY:", req.body);
 const { userName,pin } = req.body;

  try {

     if ( !userName || !pin) {

        return res.status(400).json({
             status: "fail",
             message: "Username and pin are required"
            });

        }
     const User = await user.findOne({ userName });
         if (!User) {
     return res.status(404).json({
             status: "fail",
             message: "User not found"
             });

         }
    const ispinValid = await bcrypt.compare( pin, User.pin );

        if (!ispinValid) {
          return res.status(400).json({
            status: "fail",
            message: "Invalid credentials"
            });

        }
    const token = jwt.sign({ id: User._id }, process.env.JWT_SECRET,{ expiresIn: "7d" });
            console.log("JWT_SECRET =", process.env.JWT_SECRET);
            console.log(User);
        return res.status(200).json({
            status: "success",
            message: "Login successful",
            token,

            user: {
                id: User._id,
                phoneNumber: User.phoneNumber,
                country: User.country,
                countryCode: User.countryCode,
                dialcode: User.dialcode,
                username: User.username,
                profileImage: User.profileImage,
                isProfileCompleted: User.isProfileCompleted,
                isOnline: User.isOnline,
                Lastseen: User.Lastseen,
            }
        });
        console.log(process.env.JWT_SECRET);

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            status: "error",
            message: "Server error"
        });

    }

};

// GET USER BY PHONE NUMBER
exports.searchUser = async (req, res) => {
    try {

        const { phoneNumber } = req.params;

        const foundUser = await user.findOne({ phoneNumber });

        if (!foundUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: foundUser._id,
                userName: foundUser.userName,
                phoneNumber: foundUser.phoneNumber,
                profileImage: foundUser.profileImage
            }
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// searchUserBYId
// SEARCH USER BY ID
exports.searchUserById = async (req, res) => {

    try {

        const { id } = req.params;

        const foundUser = await user.findById(id);

        if (!foundUser) {

            return res.status(404).json({

                success: false,
                message: "User not found"

            });

        }

        return res.status(200).json({

            success: true,

            user: {

                _id: foundUser._id,
                userName: foundUser.userName,
                phoneNumber: foundUser.phoneNumber,
                profileImage: foundUser.profileImage,
                isOnline: foundUser.isOnline,
                lastSeen: foundUser.lastSeen

            }

        });

    } catch (err) {

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

};


// DELETE USER 





// UPDATE USER 
exports.updateProfile = async (req, res) => {

    try {

        const { userName } = req.body;

        const loggedInUser = req.user.id;

        const currentUser = await user.findById(loggedInUser);

        if (!currentUser) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Update username if provided

        if (userName && userName.trim() !== "") {

            currentUser.userName = userName.trim();

        }

        // Update image if uploaded

        if (req.file) {

            currentUser.profileImage =
                "/uploads/profile/" + req.file.filename;

        }

        await currentUser.save();

        res.status(200).json({

            success: true,

            message: "Profile updated successfully",

            user: {

                id: currentUser._id,

                userName: currentUser.userName,

                phoneNumber: currentUser.phoneNumber,

                profileImage: currentUser.profileImage,

                country: currentUser.country,

                countryCode: currentUser.countryCode,

                dialCode: currentUser.dialCode

            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};

// module.exports = {
//     registerUser,
//     login,
//     searchUser,
//     updateProfile
// };