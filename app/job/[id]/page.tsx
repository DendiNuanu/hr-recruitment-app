import { createClientServer } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClientServer();
    const { data: job, error } = await supabase.from('jobs').select('*').eq('id', id).single();

    if (error || !job) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Simple Header */}
            <header className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-4">
                    <Link href="/" className="text-primary font-bold hover:underline">&larr; Back to Careers</Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
                    <div className="flex items-center text-gray-600 space-x-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {job.department}
                        </span>
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {job.location}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    {/* Job Image */}
                    {
                        job.job_image && (
                            <div className="mb-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                                <div className="relative h-auto w-full max-h-[500px] flex justify-center">
                                    <img
                                        src={job.job_image}
                                        alt={job.title}
                                        className="max-h-[500px] w-auto object-contain"
                                    />
                                </div>
                            </div>
                        )
                    }

                    {/* Description */}
                    <div className="prose max-w-none mb-10 text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {job.description}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 border-t pt-8">
                        <Link
                            href={`/apply/${job.id}`}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center text-lg font-bold py-3 px-6 rounded-lg transition-transform hover:-translate-y-1 shadow-md"
                        >
                            Apply Now
                        </Link>
                        <Link
                            href="/"
                            className="flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 text-center text-lg font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            Back to Careers
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
