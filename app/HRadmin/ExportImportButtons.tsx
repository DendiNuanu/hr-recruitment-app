'use client';

import { useState, useRef } from 'react';
import { exportJobsAction, exportCandidatesAction, importJobsAction, importCandidatesAction } from '@/app/actions';
import { toast } from 'sonner';
import { Download, Upload, FileText } from 'lucide-react';
import Papa from 'papaparse';

export function ExportImportButtons() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const jobsFileInputRef = useRef<HTMLInputElement>(null);
    const candidatesFileInputRef = useRef<HTMLInputElement>(null);

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

    // Import Jobs
    const handleImportJobs = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            let jsonData: any[] = [];

            if (file.name.endsWith('.csv')) {
                const text = await file.text();
                const parsed = Papa.parse(text, { header: true });
                jsonData = parsed.data as any[];
            } else {
                toast.error('Please upload a CSV file');
                setIsImporting(false);
                return;
            }

            // Create a JSON file from the parsed data
            const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
            const formData = new FormData();
            formData.append('file', jsonBlob, 'jobs.json');

            const result = await importJobsAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message || 'Jobs imported successfully!');
                // Refresh the page to show new data
                window.location.reload();
            }
        } catch (error) {
            toast.error('Failed to import jobs');
        } finally {
            setIsImporting(false);
            if (jobsFileInputRef.current) {
                jobsFileInputRef.current.value = '';
            }
        }
    };

    // Import Candidates
    const handleImportCandidates = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            let jsonData: any[] = [];

            if (file.name.endsWith('.csv')) {
                const text = await file.text();
                const parsed = Papa.parse(text, { header: true });
                jsonData = parsed.data as any[];
            } else {
                toast.error('Please upload a CSV file');
                setIsImporting(false);
                return;
            }

            // Create a JSON file from the parsed data
            const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
            const formData = new FormData();
            formData.append('file', jsonBlob, 'candidates.json');

            const result = await importCandidatesAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message || 'Candidates imported successfully!');
                // Refresh the page to show new data
                window.location.reload();
            }
        } catch (error) {
            toast.error('Failed to import candidates');
        } finally {
            setIsImporting(false);
            if (candidatesFileInputRef.current) {
                candidatesFileInputRef.current.value = '';
            }
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Export / Import Data</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </h3>

                    {/* Export Jobs */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">Jobs</p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportJobsCSV}
                                disabled={isExporting}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileText className="h-4 w-4" />
                                CSV
                            </button>
                        </div>
                    </div>

                    {/* Export Candidates */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">Candidates</p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportCandidatesCSV}
                                disabled={isExporting}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileText className="h-4 w-4" />
                                CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Import Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                    </h3>

                    {/* Import Jobs */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">Jobs (CSV)</p>
                        <input
                            ref={jobsFileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleImportJobs}
                            disabled={isImporting}
                            className="hidden"
                            id="import-jobs-file"
                        />
                        <label
                            htmlFor="import-jobs-file"
                            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <Upload className="h-4 w-4" />
                            Choose File
                        </label>
                    </div>

                    {/* Import Candidates */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">Candidates (CSV)</p>
                        <input
                            ref={candidatesFileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleImportCandidates}
                            disabled={isImporting}
                            className="hidden"
                            id="import-candidates-file"
                        />
                        <label
                            htmlFor="import-candidates-file"
                            className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <Upload className="h-4 w-4" />
                            Choose File
                        </label>
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800">
                            <strong>Note:</strong> Import files must match the export format. Required fields must be present.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
