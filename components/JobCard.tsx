import Link from 'next/link';
import Image from 'next/image';

interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    description: string;
    job_image?: string | null;
}

export function JobCard({ job }: { job: Job }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
            {/* Image if available */}
            <div className="h-48 w-full bg-gray-50 relative border-b border-gray-100">
                {job.job_image ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={job.job_image}
                            alt={job.title}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{job.title}</h3>
                <p className="text-sm text-gray-500 mb-4">
                    <span className="font-semibold text-gray-700">{job.department}</span> • {job.location}
                </p>
                <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-grow">
                    {job.description}
                </p>

                <Link
                    href={`/job/${job.id}`}
                    className="mt-auto w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-md transition-colors text-center"
                >
                    View Details & Apply
                </Link>
            </div>
        </div>
    );
}
