import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'patients', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '5h' }
}, { timestamps: true }); 

const token = mongoose.model('token', tokenSchema);
export default token;