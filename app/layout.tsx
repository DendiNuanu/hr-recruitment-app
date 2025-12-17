import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    title: "HR Recruitment - Join Our Team",
    description: "We are looking for the best talent to build a better future together",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="font-sans antialiased bg-gray-50 min-h-screen flex flex-col">
                {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
                    <div className="bg-red-600 text-white p-4 text-center font-bold sticky top-0 z-[9999]">
                        CRITICAL CONFIGURATION MISSING: Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Project Settings.
                    </div>
                )}
                {children}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
