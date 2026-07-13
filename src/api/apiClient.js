// @ts-nocheck
// Cliente de API integrado con Supabase.
// Configura en .env.local:
//   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
//   VITE_SUPABASE_ANON_KEY=tu-anon-key

import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getGenericAuthError } from '@/lib/security';

// @ts-ignore
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
  console.error(
    'Supabase credentials missing or invalid. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Helper para validar credenciales
const checkCredentials = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    throw new Error('Credenciales de Supabase no configuradas. Revisa tu archivo .env.local');
  }
};
const TOKEN_KEY = 'access_token';
const RATE_LIMIT_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_LOGIN_WINDOW = 900000; // 15 minutes

// Token management (sync with Supabase session)
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Get current user from Supabase session
const getSupabaseUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// ============================================================
// Auth API compatible con el frontend existente
// ============================================================
export const auth = {
  getToken,
  setToken,
  clearToken,

  me: async () => {
    const user = await getSupabaseUser();
    if (!user) throw new Error('Not authenticated');

    // Optionally fetch profile with role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && profile) {
      return { ...user, ...profile };
    }
    return user;
  },

  loginViaEmailPassword: async (email, password) => {
    checkCredentials();

    // Rate limiting check
    const rateLimitKey = `login:${email}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_LOGIN_ATTEMPTS, RATE_LIMIT_LOGIN_WINDOW);

    if (!rateLimit.allowed) {
      const err = new Error(getGenericAuthError());
      err.status = 429;
      err.retryAfter = rateLimit.resetTime;
      throw err;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const err = new Error(getGenericAuthError());
      err.status = 401;
      throw err;
    }

    if (data?.session?.access_token) {
      setToken(data.session.access_token);
    }

    return { access_token: data?.session?.access_token };
  },

  register: async ({ email, password }) => {
    checkCredentials();

    // Rate limiting for registration
    const rateLimitKey = `register:${email}`;
    const rateLimit = checkRateLimit(rateLimitKey, 3, 3600000); // 3 attempts per hour

    if (!rateLimit.allowed) {
      const err = new Error('Too many registration attempts. Please try again later.');
      err.status = 429;
      throw err;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      // Generic error message to prevent user enumeration
      const err = new Error('Registration failed. Please check your email and password.');
      err.status = 400;
      throw err;
    }

    // Supabase auto-sends OTP to email
    return { user: data.user };
  },

  verifyOtp: async ({ email, otpCode }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    });

    if (error) {
      const err = new Error(error.message || 'Invalid or expired OTP');
      err.status = 400;
      throw err;
    }

    if (data?.session?.access_token) {
      setToken(data.session.access_token);
    }

    return { access_token: data?.session?.access_token };
  },

  resendOtp: async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      const err = new Error(error.message || 'Failed to resend OTP');
      err.status = 400;
      throw err;
    }

    return { success: true };
  },

  resetPasswordRequest: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      const err = new Error(error.message || 'Failed to send reset email');
      err.status = 400;
      throw err;
    }

    return { success: true };
  },

  resetPassword: async ({ resetToken, newPassword }) => {
    // Note: this uses the token from the reset email link
    // In Supabase, the token is in the URL hash
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      const err = new Error(error.message || 'Failed to reset password');
      err.status = 400;
      throw err;
    }

    return { success: true };
  },

  loginWithProvider: async (provider, redirectTo = '/') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      console.error(`OAuth error: ${error.message}`);
      return;
    }

    // OAuth will redirect to callback
  },

  logout: async (redirectUrl) => {
    await supabase.auth.signOut();
    clearToken();
    if (redirectUrl) {
      window.location.href = '/';
    }
  },

  redirectToLogin: (fromUrl) => {
    const params = fromUrl ? `?from=${encodeURIComponent(fromUrl)}` : '';
    window.location.href = `/pino-pers${params}`;
  },
};

// ============================================================
// Entidades CRUD para tablas Supabase
// ============================================================
function createEntity(tableName) {
  const formatError = (error) => {
    if (!error) return new Error('Unknown error');
    const message = error.message || 'Error al obtener datos';
    const err = new Error(message);
    err.status = error.status || 500;
    return err;
  };

  return {
    async list(sort, limit) {
      checkCredentials();
      let query = supabase.from(tableName).select('*');

      // Sort: "-field" = descending, "field" = ascending
      if (sort) {
        const isDesc = sort.startsWith('-');
        const field = isDesc ? sort.slice(1) : sort;
        query = query.order(field, { ascending: !isDesc });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw formatError(error);
      return data || [];
    },

    async get(id) {
      checkCredentials();
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw formatError(error);
      return data;
    },

    async create(payload) {
      checkCredentials();
      const { data, error } = await supabase
        .from(tableName)
        .insert([payload])
        .select();
      if (error) throw formatError(error);
      return data?.[0];
    },

    async update(id, payload) {
      checkCredentials();
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', id)
        .select();
      if (error) throw formatError(error);
      return data?.[0];
    },

    async delete(id) {
      checkCredentials();
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw formatError(error);
      return { success: true };
    },

    async deleteMany(filter = {}) {
      checkCredentials();
      let query = supabase.from(tableName).delete();
      // Apply filters if provided
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { error } = await query;
      if (error) throw formatError(error);
      return { success: true };
    },

    // Polling subscription (no websockets needed)
    // Default 200ms for real-time updates with low latency
    subscribe(callback, intervalMs = 200) {
      const id = setInterval(callback, intervalMs);
      return () => clearInterval(id);
    },

    // Push instantáneo vía Supabase Realtime cuando una fila cambia
    // (requiere que la tabla esté en la publicación `supabase_realtime`).
    // Devuelve una función para cancelar la suscripción.
    onRowChange(id, callback) {
      const channel = supabase
        .channel(`${tableName}-${id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: tableName, filter: `id=eq.${id}` },
          (payload) => callback(payload.new)
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  };
}

export const entities = {
  PinoPermiso: createEntity('pino_permisos'),
};

// ============================================================
// Authorization Code handler
// ============================================================
export const saveAuthorizationCode = async (tableName, userId, authCode) => {
  checkCredentials();
  const { data, error } = await supabase
    .from(tableName)
    .update({ Etapa: authCode })
    .eq('id', userId)
    .select();

  if (error) {
    const err = new Error(error.message || 'Failed to save authorization code');
    err.status = error.status || 500;
    throw err;
  }

  return data?.[0];
};

// ============================================================
// Generic API wrapper (for backwards compatibility)
// ============================================================
export const api = {
  auth,
  entities,
  supabase,
};

export default { ...api, auth, entities, supabase };
