const User = require("../Schema/User");
const cloudinary = require("../MiddleWare/cloudinary");
const bcrypt = require('bcryptjs'); 
// SignUp Controller
const getStoreProfile = async (req, res) => {
    try {
      const storeProfile = await User.find({ profile: 'Store' }); // Find all profiles with 'Store' profile
      if (storeProfile.length === 0) {
        return res.status(404).json({ message: 'No Store profiles found' });
      }
      return res.status(200).json(storeProfile);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Controller to fetch 'Distributor' profile
  const getDistributorProfile = async (req, res) => {
    try {
      const distributorProfile = await User.find({ profile: 'Distributor' }); // Find all profiles with 'Distributor' profile
      if (distributorProfile.length === 0) {
        return res.status(404).json({ message: 'No Distributor profiles found' });
      }
      return res.status(200).json(distributorProfile);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Controller to fetch 'Brand' profile (assuming 'Brand' profile is also stored in the same User collection)
  const getBrandProfile = async (req, res) => {
    try {
      const brandProfile = await User.find({ profile: 'Brand' }); // Find all profiles with 'Brand' profile
      if (brandProfile.length === 0) {
        return res.status(404).json({ message: 'No Brand profiles found' });
      }
      return res.status(200).json(brandProfile);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

const countStoreProfiles = async (req, res) => {
    try {
      const count = await User.countDocuments({ profile: "Store" });
      res.status(200).json({ profile: "Store", count });
    } catch (error) {
      res.status(500).json({ message: "Error counting Store profiles", error });
    }
  };
  
  // Controller to count Distributor profiles
  const countDistributorProfiles = async (req, res) => {
    try {
      const count = await User.countDocuments({ profile: "Distributor" });
      res.status(200).json({ profile: "Distributor", count });
    } catch (error) {
      res.status(500).json({ message: "Error counting Distributor profiles", error });
    }
  };
  
  // Controller to count Brand profiles
  const countBrandProfiles = async (req, res) => {
    try {
      const count = await User.countDocuments({ profile: "Brand" });
      res.status(200).json({ profile: "Brand", count });
    } catch (error) {
      res.status(500).json({ message: "Error counting Brand profiles", error });
    }
  };
const signUp = async (req, res) => {
    try {
        // Clean up any extra spaces from the keys in req.body
        req.body = Object.fromEntries(
            Object.entries(req.body).map(([key, value]) => [key.trim(), value])
        );

        console.log("Received body:", req.body);

        const { Licence, Gstin } = req.files;
        const { name, contact, email, password, address, profile, shopName, gstNumber, licenseNumber } = req.body;

        // Check if both Licence and Gstin files are provided
        if (!Licence || !Gstin) {
            return res.status(400).json({ message: "Both Licence and Gstin files are required." });
        }

        // Check if the contact or email already exists
        const existingUser = await User.findOne({
            $or: [{ contact }, { email }],
        });

        if (existingUser) {
            // If a user with the same contact or email exists, return an error
            return res.status(400).json({
                message: "User with this contact or email already exists.",
            });
        }

        // Upload files to Cloudinary in parallel
        const [licenceUpload, gstinUpload] = await Promise.all([
            cloudinary.uploader.upload(Licence[0].path, {
                folder: "user_files",
                public_id: `licence_${Date.now()}`,
                resource_type: "auto",
            }),
            cloudinary.uploader.upload(Gstin[0].path, {
                folder: "user_files",
                public_id: `gstin_${Date.now()}`,
                resource_type: "auto",
            }),
        ]);

        // Extract secure URLs for the uploaded files
        const licenceImage = licenceUpload.secure_url;
        const gstinImage = gstinUpload.secure_url;

        // Create a new user object
        const newUser = new User({
            name,
            contact,
            email,
            password,
            address,
            profile,
            shopName,
            gstNumber,
            licenseNumber,
            licenceImage,
            gstinImage,
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with success
        return res.status(200).json({
            message: "Sign-up successful!",
            data: { licenceImage, gstinImage },
        });
    } catch (error) {
        console.error("Error during sign-up:", error);

        if (error.name === "MulterError") {
            return res.status(400).json({ message: "File upload error!" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare the provided password with the stored hashed password
        const passwordIsValid = await user.comparePassword(password);

        if (!passwordIsValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate a token for the user using the static method
        const token = User.generateAccessToken(user);

        // Set the token in an HTTP-only cookie
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // Only 'secure' in production
            maxAge: 24 * 60 * 60 * 1000,  // 1 day expiration
            sameSite: 'Strict',
        });

        // Respond with the token and user details
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                contact: user.contact,
                profile: user.profile,
                gstNumber:user.gstNumber,
                shopName:user.shopName,
                licenseNumber:user.licenseNumber,   

            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



// Logout Controller
const logout = (req, res) => {
    // Clear the cookie with the token
    res.clearCookie('access_token', { path: '/' });

    // Send a success message
    res.status(200).json({ message: "Logged out successfully!" });
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find user by ID
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the user details
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // User ID from the request
        const updates = req.body; // Other updates from the request body
        const files = req.files; // Files from the request

        let updateData = { ...updates }; // Initialize update object

        // Handle image uploads if files are provided
        if (files) {
            if (files.Licence) {
                const licenceUpload = await cloudinary.uploader.upload(files.Licence[0].path, {
                    folder: "user_files",
                    public_id: `licence_${Date.now()}`,
                    resource_type: "auto",
                });
                updateData.licenceImage = licenceUpload.secure_url; // Update licence image URL
            }

            if (files.Gstin) {
                const gstinUpload = await cloudinary.uploader.upload(files.Gstin[0].path, {
                    folder: "user_files",
                    public_id: `gstin_${Date.now()}`,
                    resource_type: "auto",
                });
                updateData.gstinImage = gstinUpload.secure_url; // Update GST image URL
            }
        }

        // Check if password is being updated
        if (updates.password) {
            // Hash the password before updating
            updateData.password = await bcrypt.hash(updates.password, 10);
        }

        // Find user by ID and update their data
        const updatedUser = await User.findByIdAndUpdate(id, updateData, {
            new: true, // Return the updated user
            runValidators: true, // Ensure schema validation
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with the updated user details
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    signUp,
    login,
    logout,
    getUserById,
    updateUser,
    countStoreProfiles,
    countDistributorProfiles,
    countBrandProfiles,
    getStoreProfile,
    getDistributorProfile,
    getBrandProfile
};
