'use client';

import { useState } from 'react';
import { updateCandidateStatus, updateCandidateNotes, deleteJobAction } from '@/app/actions';
import { toast } from 'sonner';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';

export function AdminJobCard({ job }: { job: any }) {
    const [expanded, setExpanded] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const res = await deleteJobAction(job.id);
        setIsDeleting(false);
        setShowDeleteModal(false);

        if (res?.error) toast.error(res.error);
        else toast.success('Job deleted successfully!');
    }

    return (
        <>
            <li className="bg-white hover:bg-gray-50 transition-colors">
                <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {/* Status Dot */}
                                <span className={`inline-block h-3 w-3 rounded-full ${job.status === 'open' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{job.title}</h3>
                                <p className="text-sm text-gray-500">{job.department} • {job.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {job.candidates?.length || 0} Applicants
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                                <Link href={`/HRadmin/jobs/${job.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                <button onClick={() => setShowDeleteModal(true)} className="text-red-600 hover:text-red-900">Delete</button>
                            </div>
                            <svg className={`h-5 w-5 text-gray-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {expanded && (
                        <div className="mt-4 pl-8 border-l-2 border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Applicants</h4>
                            {job.candidates && job.candidates.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Contact</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {job.candidates.map((edu: any) => (
                                                <CandidateRow key={edu.id} candidate={edu} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm italic">No applicants yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </li>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scaleIn">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="ml-4 text-xl font-bold text-gray-900">
                                    Delete Job?
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-4">
                            <p className="text-gray-600 mb-2">
                                Are you sure you want to delete <span className="font-semibold">"{job.title}"</span>?
                            </p>
                            <p className="text-sm text-red-600 mb-6">
                                This will permanently delete the job and all {job.candidates?.length || 0} candidate applications. This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Job'}
                                </button>
                            </div>
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
    )
}

function CandidateRow({ candidate }: { candidate: any }) {
    const handleChangeStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        const res = await updateCandidateStatus(candidate.id, newStatus);
        if (res?.error) toast.error(res.error);
        else toast.success(`Updated to ${newStatus}`);
    }

    return (
        <tr>
            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="font-medium">{candidate.full_name}</div>
                <div className="text-gray-500">{candidate.email}</div>
                <div className="text-gray-500">{candidate.phone}</div>
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm text-blue-600">
                <a href={candidate.resume_url} target="_blank" className="hover:underline">View PDF</a>
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">
                <select
                    defaultValue={candidate.status}
                    onChange={handleChangeStatus}
                    className={`block w-full pl-3 pr-10 py-2 text-sm font-semibold border-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-all ${candidate.status === 'applied' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                            candidate.status === 'screening' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                                candidate.status === 'interview' ? 'bg-purple-50 border-purple-300 text-purple-700' :
                                    candidate.status === 'offered' ? 'bg-green-50 border-green-300 text-green-700' :
                                        candidate.status === 'hired' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' :
                                            'bg-red-50 border-red-300 text-red-700'
                        }`}
                >
                    <option value="applied" className="bg-blue-50 text-blue-700">📋 Applied</option>
                    <option value="screening" className="bg-yellow-50 text-yellow-700">🔍 Screening</option>
                    <option value="interview" className="bg-purple-50 text-purple-700">💬 Interview</option>
                    <option value="offered" className="bg-green-50 text-green-700">🎁 Offered</option>
                    <option value="hired" className="bg-emerald-50 text-emerald-800">✅ Hired</option>
                    <option value="rejected" className="bg-red-50 text-red-700">❌ Rejected</option>
                </select>
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">
                <form action={async (formData) => {
                    formData.append('id', candidate.id);
                    await updateCandidateNotes(formData);
                    toast.success('Notes saved');
                }} className="flex gap-2">
                    <input type="text" name="notes" defaultValue={candidate.notes} className="border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-xs" placeholder="Add notes..." />
                    <button type="submit" className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Save</button>
                </form>
            </td>
        </tr>
    )
}
