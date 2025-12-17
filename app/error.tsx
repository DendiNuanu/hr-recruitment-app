'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    const isMissingVars = error.message.includes('MISSING_SUPABASE_VARS')

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans text-gray-900">
            <div className="w-full max-w-2xl rounded-xl border border-red-200 bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-4 text-red-600">
                    <AlertCircle className="h-10 w-10" />
                    <h2 className="text-2xl font-bold tracking-tight">Application Error</h2>
                </div>

                {isMissingVars ? (
                    <div className="space-y-6">
                        <div className="rounded-lg bg-red-50 p-4 text-red-900">
                            <strong>Critical Configuration Missing</strong>
                            <p className="mt-2 text-sm leading-relaxed text-red-800">
                                The application cannot connect to the database because the environment variables are not set.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900">How to Fix (Vercel)</h3>
                            <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
                                <li><strong>Go to Vercel Dashboard</strong> for this project.</li>
                                <li>Navigate to <strong>Settings</strong> {'>'} <strong>Environment Variables</strong>.</li>
                                <li>Add the following keys (copy them from your local <code>.env.local</code>):
                                    <ul className="mt-2 list-disc space-y-1 pl-4 font-mono text-xs text-blue-700">
                                        <li>NEXT_PUBLIC_SUPABASE_URL</li>
                                        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                                    </ul>
                                </li>
                                <li>Click <strong>Redeploy</strong> (or verify current deployment).</li>
                            </ol>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-600">Something went wrong!</p>
                        <div className="max-h-40 overflow-auto rounded bg-gray-100 p-4 font-mono text-xs text-red-600">
                            {error.message}
                        </div>
                        <button
                            onClick={() => reset()}
                            className="rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                        >
                            Try again
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
