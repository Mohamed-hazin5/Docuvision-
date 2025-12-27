
import mongoose from 'mongoose';

// Connection string with encoded password
const uri = "mongodb+srv://firewallwc123_db_user:38450%40123@cluster0.arsbvbu.mongodb.net/?appName=Cluster0";

async function checkData() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        // Define a loose schema just to read the collection
        const UserData = mongoose.model('UserData', new mongoose.Schema({}, { strict: false }));

        const users = await UserData.find({});

        if (users.length === 0) {
            console.log("No user data found in 'userdatas' collection yet.");
        } else {
            console.log(`Found ${users.length} user records:`);
            users.forEach((u: any) => {
                console.log("\n------------------------------------------------");
                console.log(`USER: ${u.userId}`);
                console.log(`Saved Charts: ${u.savedCharts?.length || 0}`);
                console.log(`Recent Activity: ${u.recentActivity?.length || 0}`);
                console.log("Last Updated:", u.lastUpdated);

                if (u.savedCharts?.length > 0) {
                    console.log("\nDetails of last 3 charts:");
                    u.savedCharts.slice(0, 3).forEach((c: any) => {
                        console.log(`- [${c.chartType}] ${c.xAxis} vs ${c.yAxis} (ID: ${c.id})`);
                    });
                }
            });
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
