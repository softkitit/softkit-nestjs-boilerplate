import { AuthBindings } from '@refinedev/core';
import { axiosInstance } from '@refinedev/simple-rest';

export const TOKEN_KEY = 'refine-auth';

export const authProvider = (apiUrl: string): AuthBindings => {
  return {
    login: async () => {
      const res = await axiosInstance.post(`${apiUrl}/auth/signin`, {
        email: 'onevovan@softkitit.com',
        password: 'Qwer!234',
      });

      if (res.data) {
        localStorage.setItem(TOKEN_KEY, res.data.accessToken);
        return {
          success: true,
          redirectTo: '/',
        };
      }

      return {
        success: false,
        error: {
          name: 'LoginError',
          message: 'Invalid username or password',
        },
      };
    },
    logout: async () => {
      localStorage.removeItem(TOKEN_KEY);
      return {
        success: true,
        redirectTo: '/login',
      };
    },
    check: async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        return {
          authenticated: true,
        };
      }

      return {
        authenticated: false,
        redirectTo: '/login',
      };
    },
    getPermissions: async () => undefined,
    getIdentity: async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        return {
          id: 1,
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/300',
        };
      }
      return null;
    },
    onError: async (error) => {
      console.error(error);
      return { error };
    },
  };
};
