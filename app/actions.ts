'use server'

import { createClientServer, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Hardcoded Admin Check
    if (email === 'admin' && password === 'admin2025!') {
        const cookieStore = await cookies()
        cookieStore.set('admin_session', 'true', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' })
        redirect('/HRadmin')
    }

    const supabase = await createClientServer()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/HRadmin')
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')

    const supabase = await createClientServer()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function applyAction(formData: FormData) {
    const jobId = formData.get('jobId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const resume = formData.get('resume') as File

    // Basic validation
    if (!name || !email || !phone || !resume || resume.size === 0) {
        return { error: 'All fields are required.' }
    }

    if (!resume.name.toLowerCase().endsWith('.pdf')) {
        return { error: 'Resume must be a PDF file.' }
    }

    const adminSupabase = createAdminClient()

    try {
        // Upload Resume
        const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}_${resume.name.replace(/\s+/g, '_')}`
        const { data: uploadData, error: uploadError } = await adminSupabase.storage
            .from('resumes')
            .upload(filename, resume, {
                contentType: 'application/pdf',
                upsert: false
            })

        if (uploadError) throw new Error("Upload failed: " + uploadError.message)

        const { data: { publicUrl } } = adminSupabase.storage
            .from('resumes')
            .getPublicUrl(filename)

        // Insert Candidate
        const { error: insertError } = await adminSupabase.from('candidates').insert({
            job_id: jobId,
            full_name: name,
            email: email.toLowerCase(),
            phone: phone,
            resume_url: publicUrl,
            notes: '',
            status: 'applied'
        })

        if (insertError) throw new Error("Database Error: " + insertError.message)

        return { success: true }
    } catch (e: any) {
        return { error: e.message || 'Something went wrong.' }
    }
}

// Admin Actions
export async function createJobAction(formData: FormData) {
    const title = formData.get('title') as string
    const department = formData.get('department') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string
    const image = formData.get('job_image') as File

    const adminSupabase = createAdminClient()
    let imageUrl = null;

    if (image && image.size > 0) {
        const filename = `job_${Date.now()}_${image.name.replace(/\s+/g, '_')}`
        const { error: upError } = await adminSupabase.storage
            .from('job-images')
            .upload(filename, image, { upsert: false })

        if (!upError) {
            const { data } = adminSupabase.storage.from('job-images').getPublicUrl(filename)
            imageUrl = data.publicUrl
        }
    }

    const { error } = await adminSupabase.from('jobs').insert({
        title, department, location, description, job_image: imageUrl, status: 'open'
    })

    if (error) return { error: error.message }

    revalidatePath('/')
    revalidatePath('/HRadmin')
    return { success: true }
}

export async function updateJobAction(formData: FormData) {
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const department = formData.get('department') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string

    const image = formData.get('job_image') as File

    const adminSupabase = createAdminClient()

    const updateData: any = {
        title, department, location, description
    }

    if (image && image.size > 0) {
        const filename = `job_${Date.now()}_${image.name.replace(/\s+/g, '_')}`
        const { error: upError } = await adminSupabase.storage
            .from('job-images')
            .upload(filename, image, { upsert: false })

        if (!upError) {
            const { data } = adminSupabase.storage.from('job-images').getPublicUrl(filename)
            updateData.job_image = data.publicUrl
        }
    }

    const { error } = await adminSupabase.from('jobs').update(updateData).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath(`/job/${id}`)
    revalidatePath('/HRadmin')
    return { success: true }
}

export async function deleteJobAction(jobId: string) {
    const adminSupabase = createAdminClient()

    // Delete candidates first
    await adminSupabase.from('candidates').delete().eq('job_id', jobId)
    const { error } = await adminSupabase.from('jobs').delete().eq('id', jobId)

    if (error) return { error: error.message }

    revalidatePath('/')
    revalidatePath('/HRadmin')
    return { success: true }
}

export async function updateCandidateStatus(candidateId: string, status: string) {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from('candidates').update({ status }).eq('id', candidateId)
    if (error) return { error: error.message }
    revalidatePath('/HRadmin')
    return { success: true }
}

export async function updateCandidateNotes(formData: FormData) {
    const id = formData.get('id') as string;
    const notes = formData.get('notes') as string;

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from('candidates').update({ notes }).eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/HRadmin')
    return { success: true }
}

export async function updateJobStatus(jobId: string, status: string) {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from('jobs').update({ status }).eq('id', jobId)

    if (error) return { error: error.message }

    revalidatePath('/HRadmin')
    return { success: true }
}

// Export/Import Actions
import Papa from 'papaparse';

export async function exportJobsAction() {
    const adminSupabase = createAdminClient()
    const { data: jobs, error } = await adminSupabase
        .from('jobs')
        .select('*, candidates(id)')
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }

    // Transform data for export
    const exportData = jobs?.map((job: any) => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        description: job.description,
        status: job.status,
        job_image: job.job_image || '', // Include image URL in export
        created_at: job.created_at,
        applicants_count: job.candidates?.length || 0
    })) || []

    return { success: true, data: exportData }
}

export async function exportCandidatesAction() {
    const adminSupabase = createAdminClient()
    const { data: candidates, error } = await adminSupabase
        .from('candidates')
        .select('*, jobs(title)')
        .order('id', { ascending: false })

    if (error) return { error: error.message }

    // Helper to extract date from resume URL
    const extractDate = (url: string) => {
        if (!url) return null;
        try {
            const filename = url.split('/').pop();
            const match = filename?.match(/^(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : null;
        } catch (e) { return null; }
    };

    // Transform data for export
    const exportData = candidates?.map((candidate: any) => ({
        id: candidate.id,
        job_id: candidate.job_id, // Added for re-import capability
        job_title: candidate.jobs?.title || 'N/A',
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone ? `="${candidate.phone}"` : '', // Force Excel to treat as string if exists
        status: candidate.status,
        notes: candidate.notes || '',
        resume_url: candidate.resume_url,
        applied_at: candidate.created_at || extractDate(candidate.resume_url) || 'N/A'
    })) || []

    return { success: true, data: exportData }
}
import * as XLSX from 'xlsx';

export async function importJobsAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    let jobs: any[] = []

    try {
        const buffer = await file.arrayBuffer();

        // 1. Check if it's an Excel file (XLSX/XLS)
        if (file.name.match(/\.(xlsx|xls)$/i)) {
            try {
                const workbook = XLSX.read(buffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                jobs = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false, // Parse dates as strings if possible
                    defval: ''  // Default value for empty cells
                });

                console.log("Parsed XLSX, rows:", jobs.length);
            } catch (e: any) {
                return { error: `Failed to parse Excel file: ${e.message}` }
            }
        } else {
            // 2. Fallback to Text/CSV processing
            const text = await file.text()

            // Check for binary garbage (in case they renamed .xlsx to .csv)
            if (text.slice(0, 100).includes('\u0000')) {
                // Try parsing as Excel anyway if renaming happened?
                try {
                    const workbook = XLSX.read(buffer, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    jobs = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
                } catch (e) {
                    return { error: 'File appears to be binary/Excel but has .csv extension. Please upload as .xlsx' }
                }
            } else if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
                try {
                    jobs = JSON.parse(text)
                    if (!Array.isArray(jobs)) return { error: 'Invalid JSON format.' }
                } catch (e) { return { error: 'Invalid JSON file.' } }
            } else {
                // Handle BOM
                const cleanText = text.replace(/^\uFEFF/, '');

                const parsed = Papa.parse(cleanText, {
                    header: true,
                    skipEmptyLines: true,
                    transformHeader: (h) => h.trim()
                })

                if (parsed.meta.fields && parsed.meta.fields.length < 2) {
                    return { error: `CSV Parsing Failed. Found only 1 column (${parsed.meta.fields[0]}). Ensure delimiter is Comma (,)` }
                }

                if (parsed.errors && parsed.errors.length > 0) {
                    const firstError = parsed.errors[0];
                    // Strict error usually? Let's be lenient if we got data.
                    if (parsed.errors[0].code !== 'TooManyFields' && parsed.errors[0].code !== 'TooFewFields') {
                        return { error: `CSV Syntax Error Row ${firstError.row}: ${firstError.message}` }
                    }
                }

                jobs = parsed.data
            }
        }

        // Debug Info
        const totalRowsFound = jobs.length;

        const adminSupabase = createAdminClient()
        let imported = 0
        let updated = 0
        let skipped = 0
        let errors = 0
        let errorDetails: string[] = []

        // Fetch existing jobs for deduplication
        const { data: existingJobsData } = await adminSupabase.from('jobs').select('id, title')
        const existingJobIds = new Set(existingJobsData?.map((j: any) => j.id))
        const existingJobTitles = new Set(existingJobsData?.map((j: any) => j.title.toLowerCase().trim()))

        let actionLog: string[] = []

        for (let index = 0; index < jobs.length; index++) {
            const job = jobs[index];
            const rowNum = index + 2;

            // Allow sloppy keys (trim/lowercase keys if needed) - PapaParse headers are case sensitive usually
            // We assume standard keys: title, department, location

            if (!job.title || !job.department || !job.location) {
                // If the row is totally empty or malformed
                const keysFound = Object.keys(job).filter(k => job[k]).join(', ');
                if (keysFound.length === 0) continue; // Skip completely empty rows

                errors++
                errorDetails.push(`Row ${rowNum}: Missing required fields (Needs title, department, location). Found: ${keysFound}`)
                continue
            }

            const normalizedTitle = job.title.trim()

            // Logic:
            // 1. If ID matches -> Update (Upsert)
            // 2. If ID missing but Title matches -> Skip (Duplicate prevention)
            // 3. Else -> Insert

            // Construct payload safely
            const jobPayload: any = {
                title: normalizedTitle,
                department: job.department,
                location: job.location,
                description: job.description || '',
                status: job.status || 'open'
            }
            // CRITICAL FIX: Only update image if column exists and is not undefined.
            // If user explicitly clears it, they should send empty string?
            // For safety, let's only update if it is a non-empty string, or if the key explicitly exists.
            if (job.job_image !== undefined && job.job_image !== '') {
                jobPayload.job_image = job.job_image
            }

            if (job.id && existingJobIds.has(job.id)) {
                // Update existing
                const { error } = await adminSupabase.from('jobs').update(jobPayload).eq('id', job.id)

                if (error) {
                    errors++; errorDetails.push(`Row ${rowNum}: Update failed - ${error.message}`)
                    actionLog.push(`Row ${rowNum}: Update Failed`)
                } else {
                    updated++
                    actionLog.push(`Row ${rowNum}: Updated "${normalizedTitle}"`)
                }
            } else if (existingJobTitles.has(normalizedTitle.toLowerCase())) {
                // Skip duplicate by title if no ID provided (or ID mismatch)
                skipped++
                actionLog.push(`Row ${rowNum}: Skipped Duplicate "${normalizedTitle}"`)
                // errorDetails.push(`Row ${rowNum}: Skipped duplicate title "${normalizedTitle}"`)
            } else {
                // Insert new
                const { error } = await adminSupabase.from('jobs').insert(jobPayload)
                if (error) {
                    errors++; errorDetails.push(`Row ${rowNum}: Insert failed - ${error.message}`)
                    actionLog.push(`Row ${rowNum}: Insert Failed`)
                } else {
                    imported++
                    actionLog.push(`Row ${rowNum}: Inserted "${normalizedTitle}"`)
                }
            }
        }

        revalidatePath('/HRadmin')

        // Detailed message
        const lastJob = jobs.length > 0 ? jobs[jobs.length - 1].title : 'None';
        let message = `File: "${file.name}". Found ${totalRowsFound} rows. Last Job in File: "${lastJob}".\nProcessed: ${imported} added, ${updated} updated, ${skipped} duplicate/skipped.`;

        if (errors > 0 || actionLog.length > 0) {
            // Include specific action logs for debugging
            const logSummary = actionLog.join('; ');
            const errSummary = errors > 0 ? ` Errors: ${errorDetails.slice(0, 3).join('; ')}` : '';
            message += ` [Details: ${logSummary}${errSummary}]`
        }

        return { success: true, message: message }
    } catch (e: any) {
        return { error: e.message || 'Failed to import jobs' }
    }
}

export async function importCandidatesAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    try {
        const buffer = await file.arrayBuffer();
        let candidates: any[] = []

        // 1. Check if it's an Excel file (XLSX/XLS)
        if (file.name.match(/\.(xlsx|xls)$/i)) {
            try {
                const workbook = XLSX.read(buffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                candidates = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    defval: ''
                });
            } catch (e: any) {
                return { error: `Failed to parse Excel file: ${e.message}` }
            }
        } else {
            // Fallback CSV
            const text = await file.text()
            if (text.slice(0, 100).includes('\u0000')) {
                try {
                    const workbook = XLSX.read(buffer, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    candidates = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
                } catch (e) {
                    return { error: 'File appears to be binary/Excel but has .csv extension. Please upload as .xlsx' }
                }
            } else if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
                try {
                    candidates = JSON.parse(text)
                    if (!Array.isArray(candidates)) return { error: 'Invalid JSON format.' }
                } catch (e) { return { error: 'Invalid JSON file.' } }
            } else {
                const cleanText = text.replace(/^\uFEFF/, '');
                const parsed = Papa.parse(cleanText, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() })
                if (parsed.meta.fields && parsed.meta.fields.length < 2) return { error: `CSV Parsing Failed. Found only 1 column.` }
                if (parsed.errors && parsed.errors.length > 0 && parsed.errors[0].code !== 'TooManyFields') {
                    return { error: `CSV Parsing Error Row ${parsed.errors[0].row}: ${parsed.errors[0].message}` }
                }
                candidates = parsed.data
            }
        }

        const adminSupabase = createAdminClient()
        let imported = 0
        let updated = 0
        let skipped = 0
        let errors = 0
        let errorDetails: string[] = []

        // Fetch verification data
        const { data: allJobs } = await adminSupabase.from('jobs').select('id, title');
        // Robust Map: Key = Trimmed Lowercase Title, Value = ID
        const jobMap = new Map(allJobs?.map((j: any) => [j.title?.trim().toLowerCase(), j.id]) || []);

        // Fetch existing candidates for deduplication (by ID usually)
        const { data: existingCandidatesData } = await adminSupabase.from('candidates').select('id, email, job_id');
        const existingCandidateIds = new Set(existingCandidatesData?.map((c: any) => c.id));

        // Complex duplicated check: Map key "email|job_id" -> candidate_id
        const processedKeys = new Set(existingCandidatesData?.map((c: any) => `${c.email?.toLowerCase()}|${c.job_id}`));

        for (let index = 0; index < candidates.length; index++) {
            const candidate = candidates[index];
            const rowNum = index + 2;
            let jobId = candidate.job_id;
            const jobTitleRaw = candidate.job_title;

            // 1. Resolve Job ID
            if (!jobId && jobTitleRaw) {
                // Aggressively clean title
                const lookupTitle = String(jobTitleRaw).trim().toLowerCase();
                jobId = jobMap.get(lookupTitle);

                if (!jobId) {
                    errorDetails.push(`Row ${rowNum}: Job '${jobTitleRaw}' not found. Checked against: ${Array.from(jobMap.keys()).join(', ')}`);
                    errors++;
                    continue; // Cannot proceed without Job ID
                }
            } else if (!jobId) {
                // Check if completely empty row
                if (!candidate.full_name && !candidate.email) continue;

                errors++; errorDetails.push(`Row ${rowNum}: Missing Job ID or Job Title`);
                continue;
            }

            // 2. Clean Phone
            let phone = candidate.phone || '';
            if (typeof phone === 'string' && phone.startsWith('="') && phone.endsWith('"')) {
                phone = phone.slice(2, -1);
            }

            // 3. Validation
            const email = candidate.email?.trim().toLowerCase();
            if (!candidate.full_name || !email) {
                errors++; errorDetails.push(`Row ${rowNum}: Missing Name or Email`);
                continue;
            }

            // 4. Deduplication / Upsert Logic
            const duplicateKey = `${email}|${jobId}`;

            const candidatePayload: any = {
                job_id: jobId,
                full_name: candidate.full_name,
                email: email,
                phone: phone,
                notes: candidate.notes || '',
                status: candidate.status || 'applied'
            }
            if (candidate.resume_url) candidatePayload.resume_url = candidate.resume_url;

            if (candidate.id && existingCandidateIds.has(candidate.id)) {
                // UPDATE existing by ID
                const { error } = await adminSupabase.from('candidates').update(candidatePayload).eq('id', candidate.id)

                if (error) { errors++; errorDetails.push(`Row ${rowNum}: Update Error - ${error.message}`) }
                else {
                    updated++;
                    processedKeys.add(duplicateKey);
                }

            } else if (processedKeys.has(duplicateKey)) {
                // SKIP Duplicate
                skipped++;
            } else {
                // INSERT New
                const { error } = await adminSupabase.from('candidates').insert(candidatePayload)

                if (error) { errors++; errorDetails.push(`Row ${rowNum}: Insert Error - ${error.message}`) }
                else {
                    imported++;
                    processedKeys.add(duplicateKey);
                }
            }
        }

        revalidatePath('/HRadmin')

        let message = `File: "${file.name}". Processed candidates: ${imported} added, ${updated} updated, ${skipped} skipped.`;
        if (errors > 0) {
            const details = errorDetails.slice(0, 3).join('; ');
            message += ` (${errors} errors: ${details}...)`;
        }

        return { success: true, message: message }
    } catch (e: any) {
        return { error: e.message || 'Failed to import candidates' }
    }
}


