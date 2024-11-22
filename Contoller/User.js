const User = require("../Schema/User");
const cloudinary = require("../MiddleWare/cloudinary");
// SignUp Controller
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


module.exports = {
    signUp,
    login,
    logout,
};
