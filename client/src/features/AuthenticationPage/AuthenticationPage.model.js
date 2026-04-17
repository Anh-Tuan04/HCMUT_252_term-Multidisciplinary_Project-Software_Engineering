const RECOVERY_STORAGE_KEY = 'smart-parking-auth-recovery-v2';
const RECOVERY_TTL_MS = 30 * 60 * 1000;

const SERVER_ORIGIN = (
    import.meta.env.VITE_SERVER_URL
    || 'http://localhost:8080'
).replace(/\/+$/, '');

const API_BASE = (
    import.meta.env.VITE_API_BASE
    || `${SERVER_ORIGIN}/api/v1`
).replace(/\/+$/, '');

const safeParse = (rawValue, fallbackValue) => {
    try {
        return JSON.parse(rawValue);
    } catch {
        return fallbackValue;
    }
};

const normalizeText = (value) => String(value ?? '').trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const toErrorMessage = (result, fallbackMessage) => {
    const firstError = Array.isArray(result?.errors) ? result.errors[0] : '';
    return firstError || result?.message || fallbackMessage;
};

const requestApi = async ({ method, path, body, accessToken }) => {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            credentials: 'include',
            body: body ? JSON.stringify(body) : undefined
        });

        const json = await response.json().catch(() => null);

        if (!response.ok || json?.success === false) {
            const errors = Array.isArray(json?.errors)
                ? json.errors
                : [json?.message || `Request failed (${response.status})`];

            return {
                success: false,
                status: response.status,
                message: errors[0],
                errors,
                data: json?.data ?? null
            };
        }

        return {
            success: true,
            status: response.status,
            message: json?.message || 'Success',
            errors: [],
            data: json?.data ?? null
        };
    } catch (error) {
        console.error(`API request error [${method} ${path}]`, error);

        return {
            success: false,
            status: 0,
            message: 'Khong the ket noi den server. Vui long kiem tra backend.',
            errors: ['Khong the ket noi den server. Vui long kiem tra backend.'],
            data: null
        };
    }
};

const readRecoverySession = () => {
    const parsed = safeParse(localStorage.getItem(RECOVERY_STORAGE_KEY), null);
    if (!parsed || typeof parsed !== 'object') {
        return null;
    }

    return {
        email: normalizeEmail(parsed.email),
        code: normalizeText(parsed.code),
        verified: Boolean(parsed.verified),
        expiresAt: Number(parsed.expiresAt) || 0
    };
};

const writeRecoverySession = (session) => {
    localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(session));
};

const clearRecoverySession = () => {
    localStorage.removeItem(RECOVERY_STORAGE_KEY);
};

const persistRecoverySession = (email, code = '', verified = false) => {
    writeRecoverySession({
        email: normalizeEmail(email),
        code: normalizeText(code),
        verified: Boolean(verified),
        expiresAt: Date.now() + RECOVERY_TTL_MS
    });
};

export const VerificationCodeStatus = Object.freeze({
    VALID: 0,
    INVALID: 1,
    EXPIRED: 2
});

export const buildLoginRequest = ({ email, password }) => ({
    email: normalizeEmail(email),
    password: String(password ?? '')
});

export const buildSignUpRequest = ({ firstName, lastName, username, email, password, role }) => ({
    firstName: normalizeText(firstName),
    lastName: normalizeText(lastName),
    username: normalizeText(username),
    email: normalizeEmail(email),
    password: String(password ?? ''),
    role: role === 'manager' ? 'manager' : 'user'
});

export const buildForgotPasswordRequest = ({ email }) => ({
    email: normalizeEmail(email)
});

export const buildVerificationCodeRequest = ({ email, code }) => ({
    email: normalizeEmail(email),
    code: normalizeText(code)
});

export const buildResetPasswordRequest = ({ email, newPassword, code, confirmPassword }) => ({
    email: normalizeEmail(email),
    code: normalizeText(code),
    newPassword: String(newPassword ?? ''),
    confirmPassword: String(confirmPassword ?? newPassword ?? '')
});

export const AuthApi = {
    login: async (request) => {
        const result = await requestApi({
            method: 'POST',
            path: '/auth/login',
            body: {
                email: normalizeEmail(request?.email),
                password: String(request?.password ?? '')
            }
        });

        if (!result.success) {
            return {
                success: false,
                message: result.message,
                errors: result.errors,
                accessToken: '',
                user: null
            };
        }

        return {
            success: true,
            message: result.message,
            errors: [],
            accessToken: String(result?.data?.access_token ?? ''),
            user: result?.data?.user ?? null
        };
    },

    signUp: async (request) => {
        const result = await requestApi({
            method: 'POST',
            path: '/auth/register',
            body: {
                firstName: normalizeText(request?.firstName),
                lastName: normalizeText(request?.lastName),
                email: normalizeEmail(request?.email),
                password: String(request?.password ?? '')
            }
        });

        return {
            success: result.success,
            message: result.message,
            errors: result.errors,
            'email is existed': !result.success && /email/i.test(result.message),
            'sign up successfully': result.success
        };
    },

    forgotPassword: async (request) => {
        const email = normalizeEmail(request?.email);
        const result = await requestApi({
            method: 'POST',
            path: '/auth/send-reset-password',
            body: { email }
        });

        if (result.success) {
            persistRecoverySession(email, '', false);
        }

        return {
            success: result.success,
            message: result.message,
            errors: result.errors,
            'email is existed': result.success
        };
    },

    verifyCode: async (request) => {
        const email = normalizeEmail(request?.email);
        const code = normalizeText(request?.code);
        const session = readRecoverySession();

        if (!session || !email || session.email !== email) {
            return {
                success: false,
                message: 'Khong tim thay phien khoi phuc cho email nay.',
                'email is existed': false,
                'code is valid': VerificationCodeStatus.INVALID
            };
        }

        if (Date.now() > Number(session.expiresAt)) {
            return {
                success: false,
                message: 'Ma xac nhan da het han. Vui long gui lai ma moi.',
                'email is existed': true,
                'code is valid': VerificationCodeStatus.EXPIRED
            };
        }

        if (!code) {
            return {
                success: false,
                message: 'Vui long nhap ma xac nhan.',
                'email is existed': true,
                'code is valid': VerificationCodeStatus.INVALID
            };
        }

        persistRecoverySession(email, code, true);

        return {
            success: true,
            message: 'Da luu ma xac nhan. He thong se kiem tra ma o buoc dat lai mat khau.',
            'email is existed': true,
            'code is valid': VerificationCodeStatus.VALID
        };
    },

    resetPassword: async (request) => {
        const email = normalizeEmail(request?.email);
        const session = readRecoverySession();
        const code = normalizeText(request?.code || session?.code);
        const newPassword = String(request?.newPassword ?? request?.['new password'] ?? '');
        const confirmPassword = String(request?.confirmPassword ?? newPassword);

        const result = await requestApi({
            method: 'PATCH',
            path: '/auth/reset-password',
            body: {
                email,
                code,
                newPassword,
                confirmPassword
            }
        });

        if (result.success) {
            clearRecoverySession();
        }

        return {
            success: result.success,
            message: result.message,
            errors: result.errors,
            'sent email': email,
            'reset password successfully': result.success
        };
    },

    findUsernameByEmail: async () => ({
        success: false,
        message: 'Backend hien tai khong ho tro tim username theo email.',
        errors: ['Backend hien tai khong ho tro tim username theo email.'],
        'email is existed': false,
        username: ''
    }),

    getRecoveryContext: () => {
        const session = readRecoverySession();
        if (!session) return null;
        return session;
    },

    clearRecoveryContext: () => {
        clearRecoverySession();
    },

    getApiBase: () => API_BASE,

    formatError: (result, fallbackMessage) => toErrorMessage(result, fallbackMessage)
};
