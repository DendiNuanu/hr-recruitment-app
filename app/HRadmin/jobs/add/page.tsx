'use client';

import { createJobAction } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddJobPage() {
    const router = useRouter();

    return (
        <div className="bg-white shadow sm:rounded-lg p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Job Opening</h2>
                <p className="text-gray-500 text-sm">Create a new opportunity for candidates.</p>
            </div>

            <form action={async (formData) => {
                const res = await createJobAction(formData);
                if (res?.error) {
                    toast.error(res.error);
                } else {
                    toast.success('Job created successfully');
                    router.push('/HRadmin');
                }
            }} className="space-y-6">

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input type="text" name="title" id="title" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Senior Frontend Developer" />
                </div>

                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                    <input type="text" name="department" id="department" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Engineering" />
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" name="location" id="location" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Remote / Bali, Indonesia" />
                </div>

                <div>
                    <label htmlFor="job_image" className="block text-sm font-medium text-gray-700">Job Image (Optional)</label>
                    <input type="file" name="job_image" id="job_image" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                    <p className="mt-1 text-xs text-gray-500">Display image for the job card and detail page.</p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
                    <textarea id="description" name="description" rows={8} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Describe the role, responsibilities, and requirements..." />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Link href="/HRadmin" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Cancel
                    </Link>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Create Job
                    </button>
                </div>
            </form>
        </div>
    )
}
