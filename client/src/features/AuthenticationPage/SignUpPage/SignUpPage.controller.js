import './SignUpPage.css';
import { SignUpPageModel } from './SignUpPage.model.js';
import { SignUpPageView } from './SignUpPage.view.js';

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

	const formData = SignUpPageView.getFormData(containerRef);
	const hasRequiredValues =
		formData.firstName
		&& formData.lastName
		&& formData.username
		&& formData.email
		&& formData.password;

	if (!hasRequiredValues) {
		SignUpPageView.setFeedback(containerRef, 'Vui long nhap day du thong tin bat buoc.', 'warning');
		return;
	}

	if (formData.password.length < 6) {
		SignUpPageView.setFeedback(containerRef, 'Mat khau can toi thieu 6 ky tu.', 'warning');
		return;
	}

	SignUpPageView.setSubmitting(containerRef, true);
	SignUpPageView.setFeedback(containerRef, 'Dang tao tai khoan...', 'info');

	try {
		const request = SignUpPageModel.createSignUpRequest(formData);
		const response = await SignUpPageModel.submitSignUp(request);

		if (response['email is existed']) {
			SignUpPageView.setFeedback(containerRef, 'Email nay da ton tai. Vui long dung email khac.', 'error');
			return;
		}

		if (!response['sign up successfully']) {
			SignUpPageView.setFeedback(containerRef, 'Dang ky that bai. Vui long thu lai.', 'error');
			return;
		}

		SignUpPageView.setFeedback(containerRef, 'Dang ky thanh cong. Dang chuyen sang trang dang nhap...', 'success');

		clearRuntime();
		redirectTimeoutId = window.setTimeout(() => {
			if (!routerRef) return;
			routerRef.navigate('/auth/login');
		}, 800);
	} catch (error) {
		console.error('Sign up failed:', error);
		SignUpPageView.setFeedback(containerRef, 'Khong the dang ky luc nay. Vui long thu lai.', 'error');
	} finally {
		SignUpPageView.setSubmitting(containerRef, false);
	}
};

export const SignUpPageController = {
	init: (container, router) => {
		clearRuntime();

		containerRef = container;
		routerRef = router;

		SignUpPageView.render(containerRef);
		SignUpPageView.bindPasswordToggle(containerRef);
		SignUpPageView.bindSubmit(containerRef, handleSubmit);
	},

	cleanup: () => {
		clearRuntime();
		containerRef = null;
		routerRef = null;
	}
};
