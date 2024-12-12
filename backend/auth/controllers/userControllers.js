import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';

const registerUser = asyncHandler(async(req,res) => {
    const {name , email , password , pic} = req.body;

    const userExists = await User.findOne({email});

    if(userExists){
        res.status(400);
        throw new Error("USER ALREADY EXISTS");

    }
    const user = await User.create({
        name,
        email, 
        password,
        pic
    })

    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
            pic: user.pic
        });
    }
    else{
        res.status(400);
        throw new Error("error occured")
    }
})


const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      pic: user.pic
    })
  }
  else {
    res.status(400);
    throw new Error("invalid username or password")
  }
});

const getUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    console.error("No user found in request");
    res.status(400);
    throw new Error("User not found or token invalid");
  }

  try {
    console.log(`Fetching user with ID: ${req.user._id}`);
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      console.error("User not found in database");
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user);
  } catch (error) {
    console.error(`Error fetching user: ${error.message}`);
    res.status(500);
    throw new Error("Server error while fetching user");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error('Name and email are required.');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  user.name = name || user.name;
  user.email = email || user.email;

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    searchHistory: updatedUser.searchHistory,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  });

});

export { User, asyncHandler, generateToken, authUser, registerUser, getUser, updateUser };