import User from '../../../backend/models/userModel.js'

export const updateUserHistory = async (userId:any,startUrls:string[], resultId:any, platform:string) => {
    const user = await User.findById(userId);
    if (user) {
        user.searchHistory.push(resultId, startUrls, platform, startUrls);
        await user.save();
        console.log('Updated user search history successfully.');
    } else {
        console.error('User not found.');
        throw new Error('User not found');
    }
};
