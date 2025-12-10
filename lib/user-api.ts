// lib/user-api.ts
import { api } from './api';
import { User } from '@/types/auth';

export const userApi = {
    // Get current user profile
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const result = await api.getProfile();
            return result.data || null;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    },

    // Get user by ID (admin only)
    getUserById: async (userId: string): Promise<User | null> => {
        try {
            const result = await api.get(`/users/${userId}`);
            return result.data || null;
        } catch (error) {
            console.error('Failed to get user by ID:', error);
            return null;
        }
    },

    // Get user by email (admin only)
    getUserByEmail: async (email: string): Promise<User | null> => {
        try {
            const result = await api.post('/users/by-email', { email });
            return result.data || null;
        } catch (error) {
            console.error('Failed to get user by email:', error);
            return null;
        }
    },

    // Update user profile
    updateUser: async (userId: string, data: Partial<User>): Promise<User | null> => {
        try {
            const result = await api.put(`/users/${userId}`, data);
            return result.data || null;
        } catch (error) {
            console.error('Failed to update user:', error);
            return null;
        }
    },

    // Get all users (admin only)
    getAllUsers: async (): Promise<User[]> => {
        try {
            const result = await api.get('/users');
            return result.data || [];
        } catch (error) {
            console.error('Failed to get all users:', error);
            return [];
        }
    },
};