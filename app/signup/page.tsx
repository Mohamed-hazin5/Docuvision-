
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-3xl">
                    🚧
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Coming Soon</h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    We are currently in a private beta. Registration will open to the public soon!
                    <br /><br />
                    In the meantime, you can try the demo account:
                    <br />
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-800">User: demo</span>
                    <span className="mx-2">|</span>
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-800">Pass: demo123</span>
                </p>

                <Link href="/login">
                    <MagneticButton className="w-full justify-center bg-slate-900 hover:bg-slate-800 py-3">
                        Back to Login
                    </MagneticButton>
                </Link>
            </div>
        </div>
    );
}
