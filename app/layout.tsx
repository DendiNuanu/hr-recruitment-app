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
                {children}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
