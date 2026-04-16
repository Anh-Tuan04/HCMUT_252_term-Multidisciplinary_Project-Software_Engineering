import './ResetPasswordPage.css';
import { ResetPasswordPageModel } from './ResetPasswordPage.model.js';
import { ResetPasswordPageView } from './ResetPasswordPage.view.js';

let containerRef = null;
let routerRef = null;
let countdownIntervalId = null;
let redirectTimeoutId = null;

const clearRuntime = () => {
	if (countdownIntervalId) {
		window.clearInterval(countdownIntervalId);
		countdownIntervalId = null;
	}

	if (redirectTimeoutId) {
		window.clearTimeout(redirectTimeoutId);
		redirectTimeoutId = null;
	}
};

const getCurrentMode = () => (
	window.location.hash.includes('/auth/reset/password') ? 'password' : 'verify'
);

const getRecoveryContext = () => ResetPasswordPageModel.getRecoveryContext();

const scheduleRedirect = (path, delayMs = 750) => {
	if (!routerRef) return;

	if (redirectTimeoutId) {
		window.clearTimeout(redirectTimeoutId);
	}

	redirectTimeoutId = window.setTimeout(() => {
		if (!routerRef) return;
		routerRef.navigate(path);
	}, delayMs);
};

const startCountdownTicker = () => {
	if (!containerRef) return;

	if (countdownIntervalId) {
		window.clearInterval(countdownIntervalId);
	}

	const updateCountdown = () => {
		if (!containerRef) return;

		const context = getRecoveryContext();
		const expiresAt = Number(context?.expiresAt) || 0;

		if (!expiresAt) {
			ResetPasswordPageView.setCountdown(containerRef, 0, true);
			return;
		}

		const remainingSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
		const isExpired = remainingSeconds <= 0;

		ResetPasswordPageView.setCountdown(containerRef, remainingSeconds, isExpired);

		if (isExpired && countdownIntervalId) {
			window.clearInterval(countdownIntervalId);
			countdownIntervalId = null;
		}
	};

	updateCountdown();
	countdownIntervalId = window.setInterval(updateCountdown, 1000);
};

const handleVerifyCodeSubmit = async (event) => {
	event.preventDefault();

	if (!containerRef) return;

	const context = getRecoveryContext();
	const email = context?.email ?? '';
	const code = ResetPasswordPageView.getVerificationCode(containerRef);

	if (!email) {
		ResetPasswordPageView.setFeedback(containerRef, 'Khong co email khoi phuc. Vui long quay lai buoc quen mat khau.', 'warning');
		return;
	}

	if (!code) {
		ResetPasswordPageView.setFeedback(containerRef, 'Vui long nhap ma xac nhan.', 'warning');
		return;
	}

	ResetPasswordPageView.setSubmitting(containerRef, true, 'verify');
	ResetPasswordPageView.setFeedback(containerRef, 'Dang xac thuc ma...', 'info');

	try {
		const request = ResetPasswordPageModel.createVerificationCodeRequest({ email, code });
		const response = await ResetPasswordPageModel.submitVerificationCode(request);

		if (!response['email is existed']) {
			ResetPasswordPageView.setFeedback(containerRef, 'Email khong ton tai trong he thong.', 'error');
			return;
		}

		const verifyStatus = Number(response['code is valid']);

		if (verifyStatus === ResetPasswordPageModel.VerificationCodeStatus.VALID) {
			ResetPasswordPageView.setFeedback(containerRef, 'Ma hop le. Dang chuyen sang buoc dat lai mat khau...', 'success');
			scheduleRedirect('/auth/reset/password');
			return;
		}

		if (verifyStatus === ResetPasswordPageModel.VerificationCodeStatus.EXPIRED) {
			ResetPasswordPageView.setFeedback(containerRef, 'Ma da het han. Vui long gui lai ma moi.', 'warning');
			return;
		}

		ResetPasswordPageView.setFeedback(containerRef, 'Ma xac nhan khong dung.', 'error');
	} catch (error) {
		console.error('Verify code failed:', error);
		ResetPasswordPageView.setFeedback(containerRef, 'Khong the xac thuc ma luc nay. Vui long thu lai.', 'error');
	} finally {
		ResetPasswordPageView.setSubmitting(containerRef, false, 'verify');
	}
};

const handleResendCode = async () => {
	if (!containerRef) return;

	const context = getRecoveryContext();
	const email = context?.email ?? '';

	if (!email) {
		ResetPasswordPageView.setFeedback(containerRef, 'Khong tim thay email khoi phuc. Vui long quay lai buoc quen mat khau.', 'warning');
		return;
	}

	ResetPasswordPageView.setSubmitting(containerRef, true, 'verify');
	ResetPasswordPageView.setFeedback(containerRef, 'Dang gui lai ma xac nhan...', 'info');

	try {
		const response = await ResetPasswordPageModel.resendVerificationCode(email);

		if (!response['email is existed']) {
			ResetPasswordPageView.setFeedback(containerRef, 'Email khong ton tai trong he thong.', 'error');
			return;
		}

		ResetPasswordPageView.setFeedback(containerRef, 'Da gui lai ma moi cho email cua ban.', 'success');
		startCountdownTicker();
	} catch (error) {
		console.error('Resend verification code failed:', error);
		ResetPasswordPageView.setFeedback(containerRef, 'Khong the gui lai ma luc nay. Vui long thu lai.', 'error');
	} finally {
		ResetPasswordPageView.setSubmitting(containerRef, false, 'verify');
	}
};

const handleResetPasswordSubmit = async (event) => {
	event.preventDefault();

	if (!containerRef) return;

	const context = getRecoveryContext();
	const email = context?.email ?? '';

	if (!email) {
		ResetPasswordPageView.setFeedback(containerRef, 'Khong co email khoi phuc. Vui long thuc hien lai tu buoc quen mat khau.', 'warning');
		return;
	}

	const formData = ResetPasswordPageView.getPasswordFormData(containerRef);

	if (!formData.newPassword || !formData.confirmPassword) {
		ResetPasswordPageView.setFeedback(containerRef, 'Vui long nhap day du mat khau moi va xac nhan.', 'warning');
		return;
	}

	if (formData.newPassword.length < 6) {
		ResetPasswordPageView.setFeedback(containerRef, 'Mat khau moi can toi thieu 6 ky tu.', 'warning');
		return;
	}

	if (formData.newPassword !== formData.confirmPassword) {
		ResetPasswordPageView.setFeedback(containerRef, 'Mat khau xac nhan khong khop.', 'error');
		return;
	}

	ResetPasswordPageView.setSubmitting(containerRef, true, 'password');
	ResetPasswordPageView.setFeedback(containerRef, 'Dang cap nhat mat khau moi...', 'info');

	try {
		const request = ResetPasswordPageModel.createResetPasswordRequest({
			email,
			newPassword: formData.newPassword
		});

		const response = await ResetPasswordPageModel.submitResetPassword(request);

		if (!response['reset password successfully']) {
			ResetPasswordPageView.setFeedback(containerRef, 'Dat lai mat khau that bai. Vui long xac thuc ma va thu lai.', 'error');
			return;
		}

		ResetPasswordPageView.setFeedback(
			containerRef,
			`Dat lai mat khau thanh cong cho ${response['sent email']}. Dang chuyen sang dang nhap...`,
			'success'
		);

		scheduleRedirect('/auth/login', 900);
	} catch (error) {
		console.error('Reset password failed:', error);
		ResetPasswordPageView.setFeedback(containerRef, 'Khong the dat lai mat khau luc nay. Vui long thu lai.', 'error');
	} finally {
		ResetPasswordPageView.setSubmitting(containerRef, false, 'password');
	}
};

const initVerifyStep = () => {
	if (!containerRef) return;

	const context = getRecoveryContext();
	const email = context?.email ?? '';

	ResetPasswordPageView.renderVerificationStep(containerRef, email);
	ResetPasswordPageView.bindVerificationSubmit(containerRef, handleVerifyCodeSubmit);
	ResetPasswordPageView.bindResendCode(containerRef, handleResendCode);
	startCountdownTicker();

	if (!email) {
		ResetPasswordPageView.setFeedback(containerRef, 'Chua co email khoi phuc. Hay quay lai buoc quen mat khau.', 'warning');
	}
};

const initPasswordStep = () => {
	if (!containerRef) return;

	const context = getRecoveryContext();
	const email = context?.email ?? '';

	if (!email) {
		if (routerRef) {
			routerRef.navigate('/auth/forgot');
		}
		return;
	}

	ResetPasswordPageView.renderPasswordStep(containerRef, email);
	ResetPasswordPageView.bindPasswordToggles(containerRef);
	ResetPasswordPageView.bindResetPasswordSubmit(containerRef, handleResetPasswordSubmit);

	if (!context?.verified) {
		ResetPasswordPageView.setFeedback(containerRef, 'Ban can xac thuc ma truoc khi dat lai mat khau.', 'warning');
	}
};

export const ResetPasswordPageController = {
	init: (container, router) => {
		clearRuntime();

		containerRef = container;
		routerRef = router;

		if (getCurrentMode() === 'password') {
			initPasswordStep();
			return;
		}

		initVerifyStep();
	},

	cleanup: () => {
		clearRuntime();
		containerRef = null;
		routerRef = null;
	}
};
