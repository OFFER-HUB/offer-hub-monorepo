import { supabase } from '../lib/supabase/supabase';

export interface ApplicationInput {
  project_id: string;
  freelancer_id: string;
  message: string;
}

export interface Application extends ApplicationInput {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const createApplication = async (input: ApplicationInput): Promise<Application> => {
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('project_id', input.project_id)
    .eq('freelancer_id', input.freelancer_id)
    .single();

  if (existingApplication) {
    throw new Error('You have already applied to this project');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('status')
    .eq('id', input.project_id)
    .single();

  if (!project || project.status !== 'pending') {
    throw new Error('This project is not accepting applications');
  }

  const { data: application, error } = await supabase
    .from('applications')
    .insert([{ ...input, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return application;
};

export const getApplicationsByProject = async (projectId: string): Promise<Application[]> => {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('id, project_id, freelancer_id, message, status, created_at')
    .eq('project_id', projectId);

  if (error) throw error;
  return applications || [];
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: 'accepted' | 'rejected'
): Promise<Application> => {
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .single();

  if (!existingApplication) {
    throw new Error('Application not found');
  }

  if (existingApplication.status !== 'pending') {
    throw new Error('Application status can only be updated once');
  }

  if (status === 'accepted') {
    const { data: project } = await supabase
      .from('applications')
      .select('project_id')
      .eq('id', applicationId)
      .single();

    if (project) {
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.project_id)
        .eq('status', 'accepted');

      if (count && count > 0) {
        throw new Error('This project already has an accepted application');
      }
    }
  }

  const { data: application, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw error;
  return application;
};
