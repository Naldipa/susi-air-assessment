import { resolveApiBaseUrl } from '~/utils/api-base-url';

type ApiRequestOptions = {
  method?: 'GET' | 'POST';
  body?: Record<string, string>;
  auth?: boolean;
};

export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const apiBaseUrl = resolveApiBaseUrl(
    String(config.public.apiBaseUrl),
    import.meta.client ? window.location.hostname : undefined,
  );

  async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {};
    if (options.auth !== false && auth.token) {
      headers.Authorization = 'Bearer ' + auth.token;
    }

    try {
      return await $fetch<T>(path, {
        baseURL: apiBaseUrl,
        method: options.method ?? 'GET',
        body: options.body,
        headers,
      });
    } catch (error) {
      const apiError = error as {
        status?: number;
        statusCode?: number;
        data?: { message?: string | string[] };
      };
      if (
        options.auth !== false &&
        (apiError.status === 401 || apiError.statusCode === 401)
      ) {
        await auth.clear();
        if (import.meta.client) await navigateTo('/login');
      }
      throw error;
    }
  }

  return { request };
}