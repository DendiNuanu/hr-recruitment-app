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
export async function exportJobsAction() {
    const adminSupabase = createAdminClient()
    const { data: jobs, error } = await adminSupabase
        .from('jobs')
        .select('*, candidates(*)')
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
        job_title: candidate.jobs?.title || 'N/A',
        full_name: candidate.full_name,
        email: candidate.email,
        phone: `="${candidate.phone}"`, // Force Excel to treat as string
        status: candidate.status,
        notes: candidate.notes || '',
        resume_url: candidate.resume_url,
        applied_at: candidate.created_at || extractDate(candidate.resume_url) || 'N/A'
    })) || []

    return { success: true, data: exportData }
}

export async function importJobsAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    try {
        const text = await file.text()
        const jobs = JSON.parse(text)

        if (!Array.isArray(jobs)) {
            return { error: 'Invalid file format. Expected an array of jobs.' }
        }

        const adminSupabase = createAdminClient()
        let imported = 0
        let errors = 0

        for (const job of jobs as any[]) {
            // Validate required fields
            if (!job.title || !job.department || !job.location) {
                errors++
                continue
            }

            const { error } = await adminSupabase.from('jobs').insert({
                title: job.title,
                department: job.department,
                location: job.location,
                description: job.description || '',
                status: job.status || 'open',
                job_image: job.job_image || null
            })

            if (error) {
                errors++
            } else {
                imported++
            }
        }

        revalidatePath('/HRadmin')
        return {
            success: true,
            message: `Imported ${imported} jobs successfully${errors > 0 ? `, ${errors} failed` : ''}`
        }
    } catch (e: any) {
        return { error: e.message || 'Failed to import jobs' }
    }
}

export async function importCandidatesAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    try {
        const text = await file.text()
        const candidates = JSON.parse(text)

        if (!Array.isArray(candidates)) {
            return { error: 'Invalid file format. Expected an array of candidates.' }
        }

        const adminSupabase = createAdminClient()
        let imported = 0
        let errors = 0

        for (const candidate of candidates as any[]) {
            // Validate required fields
            if (!candidate.full_name || !candidate.email || !candidate.job_id) {
                errors++
                continue
            }

            const { error } = await adminSupabase.from('candidates').insert({
                job_id: candidate.job_id,
                full_name: candidate.full_name,
                email: candidate.email.toLowerCase(),
                phone: candidate.phone || '',
                resume_url: candidate.resume_url || '',
                notes: candidate.notes || '',
                status: candidate.status || 'applied'
            })

            if (error) {
                errors++
            } else {
                imported++
            }
        }

        revalidatePath('/HRadmin')
        return {
            success: true,
            message: `Imported ${imported} candidates successfully${errors > 0 ? `, ${errors} failed` : ''}`
        }
    } catch (e: any) {
        return { error: e.message || 'Failed to import candidates' }
    }
}

