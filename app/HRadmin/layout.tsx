import { logoutAction } from '@/app/actions';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/HRadmin" className="text-2xl font-bold text-primary">HR Nuanu Admin</Link>
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/HRadmin" className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                <Link href="/" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">View Site</Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <form action={logoutAction}>
                                <button className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
