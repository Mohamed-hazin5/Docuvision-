
import mongoose, { Schema, model, models } from 'mongoose';

const UserDataSchema = new Schema({
    userId: { type: String, required: true, unique: true }, // Email or Auth ID
    savedCharts: { type: Array, default: [] },
    recentActivity: { type: Array, default: [] },
    stats: {
        totalReports: { type: Number, default: 0 },
        dataPointsProcessed: { type: Number, default: 0 },
    },
    lastUpdated: { type: Date, default: Date.now }
});

const UserData = models.UserData || model('UserData', UserDataSchema);

export default UserData;
