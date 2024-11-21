import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const searchHistorySchema = new mongoose.Schema({
    term: { type: String, required: true }, // The search term or URL
    platform: { type: String, required: true }, // Platform name (e.g., "telegram")
    logo: { type: String }, // URL or path to the platform logo
    date: { type: Date, default: Date.now }, // Timestamp of the search
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' }, // Reference to detailed result data
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    searchHistory: [searchHistorySchema],
}, {
    timestamps: true,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
