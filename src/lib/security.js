// Security utilities and validation schemas
import { z } from 'zod';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)');

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase();

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Register form validation
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Rate limiting in-memory store (simple frontend protection)
const rateLimitStore = new Map();

export const checkRateLimit = (key, maxAttempts = 5, windowMs = 900000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { attempts: [], blocked: false, blockedUntil: 0 };

  // Check if still blocked
  if (record.blocked && record.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(record.blockedUntil),
    };
  }

  // Reset if window expired
  record.attempts = record.attempts.filter((time) => now - time < windowMs);

  // Check if exceeded limit
  if (record.attempts.length >= maxAttempts) {
    record.blocked = true;
    record.blockedUntil = now + windowMs;
    rateLimitStore.set(key, record);
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(record.blockedUntil),
    };
  }

  // Add new attempt
  record.attempts.push(now);
  record.blocked = false;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: maxAttempts - record.attempts.length,
    resetTime: new Date(now + windowMs),
  };
};

// Reset rate limit
export const resetRateLimit = (key) => {
  rateLimitStore.delete(key);
};

// Generic error message (prevent user enumeration)
export const getGenericAuthError = () => 'Invalid email or password';

// CSRF token generation and validation
const csrfTokens = new Map();

export const generateCSRFToken = () => {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  csrfTokens.set(token, Date.now());
  // Cleanup old tokens (older than 1 hour)
  for (const [key, time] of csrfTokens.entries()) {
    if (Date.now() - time > 3600000) {
      csrfTokens.delete(key);
    }
  }
  return token;
};

export const validateCSRFToken = (token) => {
  const isValid = csrfTokens.has(token);
  if (isValid) {
    csrfTokens.delete(token); // Single-use token
  }
  return isValid;
};

// Honeypot detection (anti-bot)
export const createHoneypot = () => {
  return `hp_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateHoneypot = (honeypotFieldName, honeypotValue) => {
  // Honeypot field should be empty (real users won't fill it)
  return !honeypotValue || honeypotValue.trim() === '';
};

// Form submission timing detection (anti-bot)
const formTimestamps = new Map();

export const recordFormView = (formId) => {
  formTimestamps.set(formId, Date.now());
};

export const checkFormSubmissionTiming = (formId, minMs = 2000) => {
  const viewTime = formTimestamps.get(formId);
  if (!viewTime) return { valid: false, reason: 'Form not tracked' };

  const submissionTime = Date.now();
  const elapsed = submissionTime - viewTime;

  if (elapsed < minMs) {
    return { valid: false, reason: 'Form submitted too quickly' };
  }

  return { valid: true };
};

// Sanitize user input to prevent basic XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Validate and sanitize document numbers
export const validateDocumentNumber = (doc) => {
  // Remove non-alphanumeric, keep only digits and letters
  return doc.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

// Check for suspicious patterns
export const detectSuspiciousPattern = (data) => {
  const suspicious = {
    hasHtmlTags: /<[^>]*>/g.test(data),
    hasJavaScript: /javascript:/i.test(data),
    hasSQLPatterns: /(union|select|insert|update|delete|drop|create)/i.test(data),
    hasPathTraversal: /\.\.\//g.test(data),
  };

  return Object.values(suspicious).some((isSuspicious) => isSuspicious);
};
