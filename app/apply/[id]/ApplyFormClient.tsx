'use client';

import { useState } from 'react';
import { applyAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Upload, User, Mail, Phone, FileText, ArrowLeft } from 'lucide-react';

export default function ApplyForm({ jobId }: { jobId: string }) {
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [fileName, setFileName] = useState('');
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('jobId', jobId);

        try {
            const res = await applyAction(formData);
            setLoading(false);

            if (res?.error) {
                alert(res.error);
            } else {
                setShowSuccess(true);
            }
        } catch (error) {
            setLoading(false);
            alert('An unexpected error occurred.');
        }
    }

    return (
        <>
            <form action={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            <User className="inline w-4 h-4 mr-2" />
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            <Mail className="inline w-4 h-4 mr-2" />
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150"
                            placeholder="john@example.com"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                            <Phone className="inline w-4 h-4 mr-2" />
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150"
                            placeholder="+62 812 3456 7890"
                        />
                    </div>

                    {/* Resume Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="inline w-4 h-4 mr-2" />
                            Resume (PDF only) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                name="resume"
                                accept=".pdf"
                                required
                                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                                className="hidden"
                                id="resume-upload"
                            />
                            <label
                                htmlFor="resume-upload"
                                className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition duration-150"
                            >
                                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">
                                    {fileName || 'Click to upload your resume'}
                                </span>
                            </label>
                        </div>
                        {fileName && (
                            <p className="mt-2 text-sm text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {fileName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            'Submit Application'
                        )}
                    </button>
                </div>
            </form>

            {/* Back Link */}
            <div className="text-center mt-6">
                <Link href={`/job/${jobId}`} className="inline-flex items-center text-sm text-gray-600 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to job details
                </Link>
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
                                Application Submitted Successfully!
                            </h3>
                            <p className="text-gray-600 mb-2 leading-relaxed">
                                Thank you for your interest in joining our team! We have received your application and our recruitment team will carefully review your profile.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                We will contact you via phone or email within the next few days if your qualifications match our requirements.
                            </p>
                            <button
                                onClick={() => router.push('/careers')}
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
        </>
    );
}
