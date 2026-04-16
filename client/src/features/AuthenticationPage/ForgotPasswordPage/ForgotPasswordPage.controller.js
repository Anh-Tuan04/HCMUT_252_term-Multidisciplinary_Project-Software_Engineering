import './ForgotPasswordPage.css';
import { ForgotPasswordPageModel } from './ForgotPasswordPage.model.js';
import { ForgotPasswordPageView } from './ForgotPasswordPage.view.js';

let containerRef = null;
let routerRef = null;
let redirectTimeoutId = null;

const clearRuntime = () => {
	if (redirectTimeoutId) {
		window.clearTimeout(redirectTimeoutId);
		redirectTimeoutId = null;
	}
};

const handleSubmit = async (event) => {
	event.preventDefault();

	if (!containerRef) return;

	const email = ForgotPasswordPageView.getEmail(containerRef);

	if (!email) {
		ForgotPasswordPageView.setFeedback(containerRef, 'Vui long nhap email truoc khi tiep tuc.', 'warning');
		return;
	}

	ForgotPasswordPageView.setSubmitting(containerRef, true);
	ForgotPasswordPageView.setFeedback(containerRef, 'Dang kiem tra email va gui ma xac nhan...', 'info');

	try {
		const request = ForgotPasswordPageModel.createForgotPasswordRequest({ email });
		const response = await ForgotPasswordPageModel.submitForgotPassword(request);

		if (!response['email is existed']) {
			ForgotPasswordPageView.setFeedback(containerRef, 'Email khong ton tai trong he thong.', 'error');
			return;
		}

		ForgotPasswordPageView.setFeedback(containerRef, 'Ma xac nhan da duoc gui. Dang chuyen sang buoc xac thuc ma...', 'success');

		clearRuntime();
		redirectTimeoutId = window.setTimeout(() => {
			if (!routerRef) return;
			routerRef.navigate('/auth/reset/verify');
		}, 750);
	} catch (error) {
		console.error('Forgot password failed:', error);
		ForgotPasswordPageView.setFeedback(containerRef, 'Khong the xu ly yeu cau luc nay. Vui long thu lai.', 'error');
	} finally {
		ForgotPasswordPageView.setSubmitting(containerRef, false);
	}
};

const handleFindUsername = async () => {
	if (!containerRef) return;

	const email = ForgotPasswordPageView.getEmail(containerRef);
	if (!email) {
		ForgotPasswordPageView.setLookupFeedback(containerRef, 'Nhap email de tim ten dang nhap.', 'warning');
		return;
	}

	ForgotPasswordPageView.setLookupLoading(containerRef, true);
	ForgotPasswordPageView.setLookupFeedback(containerRef, 'Dang tim thong tin...', 'info');

	try {
		const response = await ForgotPasswordPageModel.findUsernameByEmail(email);

		if (!response['email is existed']) {
			ForgotPasswordPageView.setLookupFeedback(containerRef, 'Khong tim thay tai khoan cho email nay.', 'error');
			return;
		}

		ForgotPasswordPageView.setLookupFeedback(containerRef, `Ten dang nhap cua ban la: ${response.username}`, 'success');
	} catch (error) {
		console.error('Lookup username failed:', error);
		ForgotPasswordPageView.setLookupFeedback(containerRef, 'Khong the tim ten dang nhap luc nay.', 'error');
	} finally {
		ForgotPasswordPageView.setLookupLoading(containerRef, false);
	}
};

export const ForgotPasswordPageController = {
	init: (container, router) => {
		clearRuntime();

		containerRef = container;
		routerRef = router;

		ForgotPasswordPageView.render(containerRef);
		ForgotPasswordPageView.bindSubmit(containerRef, handleSubmit);
		ForgotPasswordPageView.bindFindUsername(containerRef, handleFindUsername);
	},

	cleanup: () => {
		clearRuntime();
		containerRef = null;
		routerRef = null;
	}
};
