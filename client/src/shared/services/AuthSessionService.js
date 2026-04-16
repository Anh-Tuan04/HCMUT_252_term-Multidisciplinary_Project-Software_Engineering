const AUTH_SESSION_KEY = 'smart-parking-auth-session-v1';

const safeParse = (rawValue) => {
    try {
        return JSON.parse(rawValue);
    } catch {
        return null;
    }
};

const readSession = () => {
    const parsed = safeParse(localStorage.getItem(AUTH_SESSION_KEY));

    if (!parsed || typeof parsed !== 'object') {
        return null;
    }

    if (parsed.isAuthenticated !== true) {
        return null;
    }

    return {
        isAuthenticated: true,
        email: typeof parsed.email === 'string' ? parsed.email : '',
        signedAt: typeof parsed.signedAt === 'number' ? parsed.signedAt : Date.now()
    };
};

const writeSession = (session) => {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

const clearSession = () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
};

const AuthSessionService = {
    signIn: (email) => {
        const safeEmail = String(email ?? '').trim().toLowerCase();

        writeSession({
            isAuthenticated: true,
            email: safeEmail,
            signedAt: Date.now()
        });
    },

    signOut: () => {
        clearSession();
    },

    isAuthenticated: () => Boolean(readSession()),

    getSession: () => readSession()
};

export default AuthSessionService;
