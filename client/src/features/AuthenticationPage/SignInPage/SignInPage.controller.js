import './SignInPage.css';
import { SignInPageModel } from './SignInPage.model.js';
import { SignInPageView } from './SignInPage.view.js';
import AuthSessionService from '../../../shared/services/AuthSessionService.js';

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

	const formData = SignInPageView.getFormData(containerRef);

	if (!formData.email || !formData.password) {
		SignInPageView.setFeedback(containerRef, 'Vui long nhap day du email va mat khau.', 'warning');
		return;
	}

	SignInPageView.setSubmitting(containerRef, true);
	SignInPageView.setFeedback(containerRef, 'Dang gui yeu cau dang nhap...', 'info');

	try {
		const request = SignInPageModel.createLoginRequest(formData);
		const response = await SignInPageModel.submitLogin(request);

		if (!response['email is existed']) {
			SignInPageView.setFeedback(containerRef, 'Email khong ton tai trong he thong.', 'error');
			return;
		}

		if (!response['password is correct']) {
			SignInPageView.setFeedback(containerRef, 'Mat khau khong dung.', 'error');
			return;
		}

		AuthSessionService.signIn(formData.email);

		SignInPageView.setFeedback(containerRef, 'Dang nhap thanh cong. Dang chuyen den trang ban do...', 'success');

		clearRuntime();
		redirectTimeoutId = window.setTimeout(() => {
			if (!routerRef) return;
			routerRef.navigate('/map');
		}, 700);
	} catch (error) {
		console.error('Sign in failed:', error);
		SignInPageView.setFeedback(containerRef, 'Khong the dang nhap luc nay. Vui long thu lai.', 'error');
	} finally {
		SignInPageView.setSubmitting(containerRef, false);
	}
};

export const SignInPageController = {
	init: (container, router) => {
		clearRuntime();

		containerRef = container;
		routerRef = router;

		SignInPageView.render(containerRef);
		SignInPageView.bindPasswordToggle(containerRef);
		SignInPageView.bindSubmit(containerRef, handleSubmit);
	},

	cleanup: () => {
		clearRuntime();
		containerRef = null;
		routerRef = null;
	}
};
