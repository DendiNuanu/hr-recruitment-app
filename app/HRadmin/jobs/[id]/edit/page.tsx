import EditJobForm from './EditJobFormClient';
import { createClientServer } from '@/lib/supabase';
import Link from 'next/link';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createClientServer();
    const { data: job } = await supabase.from('jobs').select('*').eq('id', id).single();

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">Job not found</p>
                    <Link href="/HRadmin" className="text-primary hover:underline mt-4 inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <EditJobForm job={job} />
        </div>
    )
}
