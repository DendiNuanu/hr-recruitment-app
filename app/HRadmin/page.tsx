import { createClientServer } from '@/lib/supabase';
import Link from 'next/link';
import { AdminJobCard } from './AdminJobCard';

export const revalidate = 0;

export default async function AdminDashboard() {
    const supabase = await createClientServer();
    const { data: jobs } = await supabase.from('jobs').select('*, candidates(*)').order('created_at', { ascending: false });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <Link href="/HRadmin/jobs/add" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium">
                    + Add New Job
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {jobs?.map((job) => (
                        <AdminJobCard key={job.id} job={job} />
                    ))}
                </ul>
            </div>
        </div>
    )
}
