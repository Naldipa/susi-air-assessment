import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LoginResponse, PilotProfile } from '~/types/api';

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('susi-pilot-token', {
    default: () => null,
    maxAge: 8 * 60 * 60,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  });
  const user = ref<PilotProfile | null>(null);

  async function login(username: string, password: string): Promise<PilotProfile> {
    const api = useApi();
    const result = await api.request<LoginResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { username, password },
    });
    token.value = result.accessToken;
    return loadProfile();
  }

  async function loadProfile(): Promise<PilotProfile> {
    if (!token.value) throw new Error('You are not signed in.');
    const api = useApi();
    user.value = await api.request<PilotProfile>('/pilot/me');
    return user.value;
  }

  async function clear(): Promise<void> {
    token.value = null;
    user.value = null;
  }

  return { token, user, login, loadProfile, clear };
});
