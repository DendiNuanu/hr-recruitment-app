import ApplyForm from './ApplyFormClient';

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-blue-600 px-8 py-10 text-center">
                        <h2 className="text-3xl font-extrabold text-white mb-2">
                            Submit Your Application
                        </h2>
                        <p className="text-blue-100">
                            Take the first step towards your dream career
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className="px-8 py-10">
                        <ApplyForm jobId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
