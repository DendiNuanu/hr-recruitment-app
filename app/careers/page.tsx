import { createClientServer } from '@/lib/supabase';
import Link from 'next/link';
import { JobCard } from '@/components/JobCard';
import { Briefcase } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 0;

export default async function CareersPage() {
    const supabase = await createClientServer();
    const { data: jobs } = await supabase.from('jobs').select('*').eq('status', 'open').order('created_at', { ascending: false });

    return (
        <div className="min-h-screen">
            {/* Hero Section with Background Image */}
            <div className="relative overflow-hidden min-h-[500px]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://harpersbazaar.com.au/wp-content/uploads/2025/05/THK-Tower-5-1536x1150.jpg"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                        quality={90}
                    />
                    {/* Dark Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="inline-flex items-center justify-center mb-8">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden bg-white shadow-2xl ring-4 ring-white ring-opacity-50">
                            <Image
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCZO-G8Ru9G046DX0sQ8zcs8K14eDzAivzng&s"
                                alt="Nuanu Logo"
                                fill
                                className="object-cover rounded-full"
                                priority
                            />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                        Join Our Team
                    </h1>
                    <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                        We are looking for the best talent to build a better future together
                    </p>
                </div>
            </div>

            {/* Jobs Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Open Positions</h2>

                    {jobs && jobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {jobs.map((job: any) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                                <Briefcase className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-xl text-gray-600 mb-2">No open positions at the moment</p>
                            <p className="text-gray-500">Check back soon for new opportunities!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm">
                        © 2025 Built with <span className="text-red-500 animate-pulse">❤️</span> by <span className="font-semibold">Nuanu Creative City</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
