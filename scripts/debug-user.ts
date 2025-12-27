
import mongoose from 'mongoose';
import User from '@/lib/models/User';

// Connection string with encoded password
const uri = "mongodb+srv://firewallwc123_db_user:38450%40123@cluster0.arsbvbu.mongodb.net/?appName=Cluster0";

async function checkUser(email: string) {
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        // We need to register the model if not already registered by Next.js app context
        // But since we are running isolated script, we just use the imported one or define it inline if needed.
        // Importing might fail if it depends on relative paths not set up for tsx execution context perfectly without tsconfig paths.
        // Let's define schema inline to be safe and quick.

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            name: String,
            email: String,
            password: String
        }));

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User '${email}' NOT found.`);

            // List all users to see if it was saved under a different email/format
            const allUsers = await User.find({});
            console.log(`Total users in DB: ${allUsers.length}`);
            allUsers.forEach(u => console.log(` - ${u.email} (${u.name})`));

        } else {
            console.log(`✅ User found:`);
            console.log(` - ID: ${user._id}`);
            console.log(` - Email: ${user.email}`);
            console.log(` - Password Hash: ${user.password.substring(0, 10)}...`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

// Check for the email seen in the screenshot
checkUser('m@gmail.com');
