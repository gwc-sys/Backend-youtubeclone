import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // user register  step 
    // get user details from frontend 
    // validation - not empty
    // check if user already exists: username , email
    // check for images , check for avatar 
    // upload them to clodinary
    // create user object  --- create entry in db 
    // remove password and refresh token field from response 
    // check for user creation 
    // return response 

    const { fullname, email, username, password } = req.body
    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, " all filed are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, " User with email or username already exists")
    }

    // File upload on localserver
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    const coverImageLocalPth =  req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, " avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPth)

    if (!avatar) {
        throw new ApiError(400, " avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wring while registering the user ")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, " User register Successfully")
    )
})

export { registerUser }