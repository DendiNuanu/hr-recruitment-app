'use client';

import { useState } from 'react';
import { exportJobsAction, exportCandidatesAction } from '@/app/actions';
import { toast } from 'sonner';
import { Download, FileText, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

export function ExportSection() {
    const [isExportingJobs, setIsExportingJobs] = useState(false);
    const [isExportingCandidates, setIsExportingCandidates] = useState(false);

    // Export Jobs to CSV
    const handleExportJobsCSV = async () => {
        setIsExportingJobs(true);
        try {
            const result = await exportJobsAction();
            if (result.error) {
                toast.error(result.error);
                return;
            }

            const csv = Papa.unparse(result.data || []);
            downloadFile(csv, `jobs_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
            toast.success('Jobs exported to CSV successfully!');
        } catch (error) {
            toast.error('Failed to export jobs');
        } finally {
            setIsExportingJobs(false);
        }
    };

    // Export Candidates to CSV
    const handleExportCandidatesCSV = async () => {
        setIsExportingCandidates(true);
        try {
            const result = await exportCandidatesAction();
            if (result.error) {
                toast.error(result.error);
                return;
            }

            const csv = Papa.unparse(result.data || []);
            downloadFile(csv, `candidates_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
            toast.success('Candidates exported to CSV successfully!');
        } catch (error) {
            toast.error('Failed to export candidates');
        } finally {
            setIsExportingCandidates(false);
        }
    };

    // Helper function to download files
    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center mb-4 sm:mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mr-3 shadow-sm border border-blue-100">
                    <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
                    <p className="text-sm text-gray-500 hidden sm:block">Download your data for analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Jobs Card */}
                <div className="group relative p-5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white hover:border-green-200 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                        <FileText className="h-10 w-10 text-green-200 group-hover:text-green-500 transition-colors" />
                    </div>
                    <div className="flex flex-col h-full justify-between gap-4">
                        <div className="z-10">
                            <h3 className="text-lg font-semibold text-gray-900">Jobs</h3>
                            <p className="text-sm text-gray-500 mt-1">Export all job postings to CSV format</p>
                        </div>
                        <button
                            onClick={handleExportJobsCSV}
                            disabled={isExportingJobs}
                            className="z-10 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isExportingJobs ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <FileText className="h-5 w-5" />
                            )}
                            <span>{isExportingJobs ? 'Exporting...' : 'Download Jobs CSV'}</span>
                        </button>
                    </div>
                </div>

                {/* Export Candidates Card */}
                <div className="group relative p-5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                        <FileText className="h-10 w-10 text-blue-200 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="flex flex-col h-full justify-between gap-4">
                        <div className="z-10">
                            <h3 className="text-lg font-semibold text-gray-900">Candidates</h3>
                            <p className="text-sm text-gray-500 mt-1">Export all candidate applications to CSV format</p>
                        </div>
                        <button
                            onClick={handleExportCandidatesCSV}
                            disabled={isExportingCandidates}
                            className="z-10 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isExportingCandidates ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <FileText className="h-5 w-5" />
                            )}
                            <span>{isExportingCandidates ? 'Exporting...' : 'Download Candidates CSV'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
