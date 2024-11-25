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


const authUser = asyncHandler(async(req,res) => {
    const { email , password} = req.body;
 const user = await User.findOne({email});

if(user && (await user.matchPassword(password))){
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        pic: user.pic
    })
}
else{
    res.status(400);
    throw new Error("invalid username or password")
}
})

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  });
  
export { User, asyncHandler, generateToken, authUser, registerUser, getUser };