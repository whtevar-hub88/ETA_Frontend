import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://expenses-tracker-8k6o.onrender.com';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_TOKEN: '/api/auth/verify-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    
    // Expense endpoints
    EXPENSES: '/api/expenses',
    EXPENSE_CATEGORIES: '/api/expense-categories',
    
    // User endpoints
    USER_PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/update-profile',
};

export const getAuthHeader = async () => {
    const token = await SecureStore.getItemAsync('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}; 