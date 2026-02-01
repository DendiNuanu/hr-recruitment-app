'use client';

import { useState } from 'react';
import { exportJobsAction, exportCandidatesAction } from '@/app/actions';
import { toast } from 'sonner';
import { Download, FileText } from 'lucide-react';
import Papa from 'papaparse';

export function ExportImportButtons() {
    const [isExporting, setIsExporting] = useState(false);

    // Export Jobs to CSV
    const handleExportJobsCSV = async () => {
        setIsExporting(true);
        try {
            const result = await exportJobsAction();
            if (result.error) {
                toast.error(result.error);
                return;
            }

            const csv = Papa.unparse(result.data || []);
            downloadFile(csv, 'jobs_export.csv', 'text/csv');
            toast.success('Jobs exported to CSV successfully!');
        } catch (error) {
            toast.error('Failed to export jobs');
        } finally {
            setIsExporting(false);
        }
    };

    // Export Candidates to CSV
    const handleExportCandidatesCSV = async () => {
        setIsExporting(true);
        try {
            const result = await exportCandidatesAction();
            if (result.error) {
                toast.error(result.error);
                return;
            }

            const csv = Papa.unparse(result.data || []);
            downloadFile(csv, 'candidates_export.csv', 'text/csv');
            toast.success('Candidates exported to CSV successfully!');
        } catch (error) {
            toast.error('Failed to export candidates');
        } finally {
            setIsExporting(false);
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <Download className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Jobs Card */}
                <div className="group p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-green-200 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col h-full justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Jobs</h3>
                            <p className="text-sm text-gray-500 mt-1">Export all job postings to CSV format</p>
                        </div>
                        <button
                            onClick={handleExportJobsCSV}
                            disabled={isExporting}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            <FileText className="h-5 w-5" />
                            <span>Download Jobs CSV</span>
                        </button>
                    </div>
                </div>

                {/* Export Candidates Card */}
                <div className="group p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col h-full justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Candidates</h3>
                            <p className="text-sm text-gray-500 mt-1">Export all candidate applications to CSV format</p>
                        </div>
                        <button
                            onClick={handleExportCandidatesCSV}
                            disabled={isExporting}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            <FileText className="h-5 w-5" />
                            <span>Download Candidates CSV</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
