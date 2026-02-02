'use client';

import { useState, useRef } from 'react';
import { importJobsAction, importCandidatesAction } from '@/app/actions';
import { toast } from 'sonner';
import { Upload, FileUp, Loader2 } from 'lucide-react';

export function ImportSection() {
    const [isImportingJobs, setIsImportingJobs] = useState(false);
    const [isImportingCandidates, setIsImportingCandidates] = useState(false);

    // Refs for hidden file inputs
    const jobsInputRef = useRef<HTMLInputElement>(null);
    const candidatesInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        action: typeof importJobsAction,
        setLoading: (loading: boolean) => void,
        type: 'jobs' | 'candidates'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await action(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message);
            }
        } catch (error) {
            toast.error(`Failed to import ${type}`);
        } finally {
            setLoading(false);
            // Reset input so same file can be selected again if needed
            if (e.target) e.target.value = '';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
            <div className="flex items-center mb-4 sm:mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg mr-3 shadow-sm border border-purple-100">
                    <Upload className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Import Data</h2>
                    <p className="text-sm text-gray-500 hidden sm:block">Upload CSV or JSON files to bulk add data</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Import Jobs Card */}
                <div className="group relative p-5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                        <FileUp className="h-10 w-10 text-purple-200 group-hover:text-purple-500 transition-colors" />
                    </div>

                    <div className="flex flex-col h-full justify-between gap-4">
                        <div className="z-10">
                            <h3 className="text-lg font-semibold text-gray-900">Import Jobs</h3>
                            <p className="text-sm text-gray-500 mt-1">Upload a CSV with columns: Title, Department, Location...</p>
                        </div>

                        <input
                            type="file"
                            accept=".csv,.json,.xlsx,.xls"
                            className="hidden"
                            ref={jobsInputRef}
                            onChange={(e) => handleFileChange(e, importJobsAction, setIsImportingJobs, 'jobs')}
                        />

                        <button
                            onClick={() => jobsInputRef.current?.click()}
                            disabled={isImportingJobs}
                            className="z-10 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isImportingJobs ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Upload className="h-5 w-5" />
                            )}
                            <span>{isImportingJobs ? 'Importing...' : 'Upload Jobs CSV'}</span>
                        </button>
                    </div>
                </div>

                {/* Import Candidates Card */}
                <div className="group relative p-5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-white hover:border-pink-300 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                        <FileUp className="h-10 w-10 text-pink-200 group-hover:text-pink-500 transition-colors" />
                    </div>

                    <div className="flex flex-col h-full justify-between gap-4">
                        <div className="z-10">
                            <h3 className="text-lg font-semibold text-gray-900">Import Candidates</h3>
                            <p className="text-sm text-gray-500 mt-1">Upload a CSV with columns: Full Name, Email, Phone...</p>
                        </div>

                        <input
                            type="file"
                            accept=".csv,.json,.xlsx,.xls"
                            className="hidden"
                            ref={candidatesInputRef}
                            onChange={(e) => handleFileChange(e, importCandidatesAction, setIsImportingCandidates, 'candidates')}
                        />

                        <button
                            onClick={() => candidatesInputRef.current?.click()}
                            disabled={isImportingCandidates}
                            className="z-10 w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isImportingCandidates ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Upload className="h-5 w-5" />
                            )}
                            <span>{isImportingCandidates ? 'Importing...' : 'Upload Candidates CSV'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
