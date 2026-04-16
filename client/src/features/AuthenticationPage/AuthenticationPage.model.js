const USERS_STORAGE_KEY = 'smart-parking-auth-users-v1';
const RECOVERY_STORAGE_KEY = 'smart-parking-auth-recovery-v1';

const NETWORK_DELAY_MS = 280;
const VERIFICATION_CODE_TTL_MS = 2 * 60 * 1000;

const defaultUsers = [
	{
		firstName: 'Demo',
		lastName: 'User',
		username: 'demouser',
		email: 'user@smartparking.com',
		password: '123456',
		role: 'user'
	},
	{
		firstName: 'Demo',
		lastName: 'Manager',
		username: 'manager01',
		email: 'manager@smartparking.com',
		password: '123456',
		role: 'manager'
	}
];

const wait = (ms) => new Promise((resolve) => {
	window.setTimeout(resolve, ms);
});

const safeParse = (value, fallbackValue) => {
	try {
		return JSON.parse(value);
	} catch {
		return fallbackValue;
	}
};

const normalizeText = (value) => String(value ?? '').trim();
const normalizeEmail = (email) => normalizeText(email).toLowerCase();

const readUsers = () => {
	const parsed = safeParse(localStorage.getItem(USERS_STORAGE_KEY), []);
	return Array.isArray(parsed) ? parsed : [];
};

const writeUsers = (users) => {
	localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const readRecoverySession = () => {
	const parsed = safeParse(localStorage.getItem(RECOVERY_STORAGE_KEY), null);
	return parsed && typeof parsed === 'object' ? parsed : null;
};

const writeRecoverySession = (session) => {
	localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(session));
};

const clearRecoverySession = () => {
	localStorage.removeItem(RECOVERY_STORAGE_KEY);
};

const findUserByEmail = (users, email) => {
	const normalizedEmail = normalizeEmail(email);
	return users.find((user) => normalizeEmail(user.email) === normalizedEmail) ?? null;
};

const generateVerificationCode = () => {
	const code = 100000 + Math.floor(Math.random() * 900000);
	return String(code);
};

const ensureDefaultUsers = () => {
	if (readUsers().length > 0) return;
	writeUsers(defaultUsers);
};

ensureDefaultUsers();

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
	'first name': normalizeText(firstName),
	'last name': normalizeText(lastName),
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

export const buildResetPasswordRequest = ({ email, newPassword }) => ({
	email: normalizeEmail(email),
	'new password': String(newPassword ?? '')
});

export const AuthApi = {
	login: async (request) => {
		await wait(NETWORK_DELAY_MS);

		const users = readUsers();
		const email = normalizeEmail(request?.email);
		const password = String(request?.password ?? '');
		const user = findUserByEmail(users, email);

		return {
			'email is existed': Boolean(user),
			'password is correct': Boolean(user && user.password === password)
		};
	},

	signUp: async (request) => {
		await wait(NETWORK_DELAY_MS);

		const users = readUsers();
		const email = normalizeEmail(request?.email);
		const emailExists = Boolean(findUserByEmail(users, email));

		if (emailExists) {
			return {
				'email is existed': true,
				'sign up successfully': false
			};
		}

		users.push({
			firstName: normalizeText(request?.['first name']),
			lastName: normalizeText(request?.['last name']),
			username: normalizeText(request?.username),
			email,
			password: String(request?.password ?? ''),
			role: request?.role === 'manager' ? 'manager' : 'user'
		});

		writeUsers(users);

		return {
			'email is existed': false,
			'sign up successfully': true
		};
	},

	forgotPassword: async (request) => {
		const users = readUsers();
		const email = normalizeEmail(request?.email);
		const user = findUserByEmail(users, email);

		if (user) {
			const verificationCode = generateVerificationCode();

			writeRecoverySession({
				email,
				code: verificationCode,
				expiresAt: Date.now() + VERIFICATION_CODE_TTL_MS,
				verified: false
			});

			console.info(`[AuthMock] Sent verification code ${verificationCode} to ${email}`);
		}

		await wait(NETWORK_DELAY_MS);

		return {
			'email is existed': Boolean(user)
		};
	},

	verifyCode: async (request) => {
		await wait(NETWORK_DELAY_MS);

		const users = readUsers();
		const email = normalizeEmail(request?.email);
		const code = normalizeText(request?.code);
		const user = findUserByEmail(users, email);

		if (!user) {
			return {
				'email is existed': false,
				'code is valid': VerificationCodeStatus.INVALID
			};
		}

		const recoverySession = readRecoverySession();

		if (!recoverySession || recoverySession.email !== email) {
			return {
				'email is existed': true,
				'code is valid': VerificationCodeStatus.INVALID
			};
		}

		if (Date.now() > Number(recoverySession.expiresAt)) {
			return {
				'email is existed': true,
				'code is valid': VerificationCodeStatus.EXPIRED
			};
		}

		if (recoverySession.code !== code) {
			return {
				'email is existed': true,
				'code is valid': VerificationCodeStatus.INVALID
			};
		}

		writeRecoverySession({
			...recoverySession,
			verified: true
		});

		return {
			'email is existed': true,
			'code is valid': VerificationCodeStatus.VALID
		};
	},

	resetPassword: async (request) => {
		await wait(NETWORK_DELAY_MS);

		const email = normalizeEmail(request?.email);
		const newPassword = String(request?.['new password'] ?? '');
		const users = readUsers();
		const userIndex = users.findIndex((user) => normalizeEmail(user.email) === email);
		const recoverySession = readRecoverySession();

		const canResetPassword =
			userIndex >= 0
			&& recoverySession
			&& recoverySession.email === email
			&& recoverySession.verified === true;

		const resetSuccessfully = Boolean(canResetPassword && newPassword.length > 0);

		if (resetSuccessfully) {
			users[userIndex] = {
				...users[userIndex],
				password: newPassword
			};
			writeUsers(users);
			clearRecoverySession();
		}

		return {
			'sent email': email,
			'reset password successfully': resetSuccessfully
		};
	},

	findUsernameByEmail: async (emailValue) => {
		await wait(NETWORK_DELAY_MS - 40);

		const users = readUsers();
		const user = findUserByEmail(users, emailValue);

		return {
			'email is existed': Boolean(user),
			username: user?.username ?? ''
		};
	},

	getRecoveryContext: () => {
		const session = readRecoverySession();
		if (!session) return null;

		return {
			email: normalizeEmail(session.email),
			expiresAt: Number(session.expiresAt) || 0,
			verified: Boolean(session.verified)
		};
	}
};
