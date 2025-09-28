 
import { CreateProjectDTO, ProjectDraft, ProjectResponse } from "@/types/project.types";
import axios, { AxiosError } from "axios";
import { isApiError } from "@/utils/type-guards";
import { useState } from "react";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    headers: {
        'Content-Type': 'application/json'
    },
});

const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
    try {
        const { data } = await request;
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            const message = error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data 
                ? String(error.response.data.message) 
                : 'API request failed';
            throw new Error(message);
        }
        throw new Error('API request failed');
    }
}

export const useProjectsApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProject = async (project: CreateProjectDTO) => {
        setLoading(true);
        setError(null);
        try {
            const result = await handleRequest<ProjectResponse>(api.post('/api/projects', project));
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await handleRequest<ProjectResponse[]>(api.get('/api/projects'));
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getProjectById = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await handleRequest<ProjectResponse>(api.get(`/api/projects/${id}`));
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (id: string, project: Partial<CreateProjectDTO>) => {
        setLoading(true);
        setError(null);
        try {
            const result = await handleRequest<ProjectResponse>(api.patch(`/api/projects/${id}`, project));
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await handleRequest<{ success: boolean; message: string }>(api.delete(`/api/projects/${id}`));
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createProject,
        getProjects,
        getProjectById,
        updateProject,
        deleteProject,
        clearError: () => setError(null)
    }
};

type MinimalUser = { id: string };
export const mapData = (projectData: ProjectDraft, authenticatedUser: MinimalUser | string): CreateProjectDTO => ({
    client_id: typeof authenticatedUser === "string" ? authenticatedUser : authenticatedUser.id,
    title: projectData.title,
    description: projectData.description,
    category: projectData.category,
    budget: projectData.budgetAmount
})