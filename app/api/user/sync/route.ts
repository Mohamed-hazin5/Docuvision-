
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import UserData from "@/lib/models/UserData";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { savedCharts, recentActivity, stats } = await req.json();

        await connectToDatabase();

        await UserData.findOneAndUpdate(
            { userId: session.user.email },
            {
                savedCharts,
                recentActivity,
                stats,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const data = await UserData.findOne({ userId: session.user.email });

        if (!data) {
            return NextResponse.json({
                savedCharts: [],
                recentActivity: [],
                stats: { totalReports: 0, dataPointsProcessed: 0 }
            });
        }

        return NextResponse.json({
            savedCharts: data.savedCharts,
            recentActivity: data.recentActivity,
            stats: data.stats
        });
    } catch (error: any) {
        console.error("Fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
