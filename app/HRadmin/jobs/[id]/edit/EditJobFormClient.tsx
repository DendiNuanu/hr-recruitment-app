'use client';

import { useState } from 'react';
import { updateJobAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, CheckCircle } from 'lucide-react';

export default function EditJobForm({ job }: { job: any }) {
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setSubmitting(true);
        formData.append('id', job.id);

        const res = await updateJobAction(formData);
        setSubmitting(false);

        if (res?.error) {
            alert(res.error);
        } else {
            setShowSuccess(true);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 px-8 py-10">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-white bg-opacity-20">
                            <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="ml-4 text-3xl font-extrabold text-white">
                            Edit Job Opening
                        </h2>
                    </div>
                    <p className="text-blue-100">
                        Update the details for this position
                    </p>
                </div>

                {/* Form */}
                <div className="px-8 py-10">
                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                Job Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                defaultValue={job.title}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150"
                                placeholder="e.g. Senior Frontend Developer"
                            />
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="department"
                                id="department"
                                required
                                defaultValue={job.department}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150"
                                placeholder="e.g. Engineering"
                            />
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                required
                                defaultValue={job.location}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150"
                                placeholder="e.g. Remote / Bali, Indonesia"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Job Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={8}
                                required
                                defaultValue={job.description}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150"
                                placeholder="Describe the role, responsibilities, and requirements..."
                            />
                        </div>

                        {job.job_image && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Current Job Image
                                </label>
                                <img src={job.job_image} alt="Job" className="w-full h-48 object-cover rounded-lg" />
                                <p className="text-xs text-gray-500 mt-2">Note: Image cannot be changed during edit. Delete and recreate the job to change the image.</p>
                            </div>
                        )}

                        <div className="flex space-x-3 pt-6 border-t">
                            <Link
                                href="/HRadmin"
                                className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Job'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scaleIn">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 animate-bounce">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Job Updated Successfully!
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                The job posting for <span className="font-semibold">"{job.title}"</span> has been updated with the new information.
                            </p>
                            <button
                                onClick={() => router.push('/HRadmin')}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                OK!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}</style>
        </div>
    );
}
