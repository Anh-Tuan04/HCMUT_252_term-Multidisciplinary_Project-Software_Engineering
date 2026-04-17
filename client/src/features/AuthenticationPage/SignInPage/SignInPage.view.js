const clearFeedbackClasses = (feedbackElement) => {
	feedbackElement.classList.remove('is-success', 'is-error', 'is-warning', 'is-info');
};

export const SignInPageView = {
	render: (container) => {
		container.innerHTML = `
			<div class="page-wrapper">
				<main class="auth-shell">
					<section class="auth-card">
						<p class="chip">Smart Parking</p>
						<h2 class="login-header">Dang nhap</h2>
						<p class="desc">Dang nhap de quan ly thong tin bai do xe va tai khoan cua ban.</p>

						<form class="auth-form" id="signin-form" novalidate>
							<div class="input-group">
								<label class="label-text" for="signin-email">Nhap email cua ban</label>
								<input id="signin-email" type="email" class="input-field" placeholder="Email cua ban" required>
							</div>

							<div class="input-group">
								<label class="label-text" for="signin-password">Nhap mat khau cua ban</label>
								<div class="password-box">
									<input type="password" id="signin-password" class="input-field" placeholder="Mat khau" required>
									<button type="button" class="toggle-btn" id="signin-toggle-password" aria-label="Hien thi mat khau">
										<span id="signin-eye-icon">Show</span>
									</button>
								</div>
							</div>

							<a href="#/auth/forgot" class="forgot-link">Ban quen mat khau?</a>
							<p class="auth-feedback is-hidden" id="signin-feedback" aria-live="polite"></p>

							<div class="button-group">
								<button type="submit" class="btn btn-submit" id="signin-submit-btn">Dang nhap</button>
								<a href="#/auth" class="btn btn-back">Quay lai</a>
							</div>
						</form>
					</section>
				</main>
			</div>
		`;
	},

	bindSubmit: (container, handler) => {
		const formElement = container.querySelector('#signin-form');
		if (!formElement) return;

		formElement.addEventListener('submit', (event) => {
			handler(event);
		});
	},

	bindPasswordToggle: (container) => {
		const passwordInput = container.querySelector('#signin-password');
		const iconElement = container.querySelector('#signin-eye-icon');
		const toggleButton = container.querySelector('#signin-toggle-password');

		if (!passwordInput || !iconElement || !toggleButton) return;

		toggleButton.addEventListener('click', () => {
			const shouldShowPassword = passwordInput.type === 'password';
			passwordInput.type = shouldShowPassword ? 'text' : 'password';
			iconElement.textContent = shouldShowPassword ? 'Hide' : 'Show';
		});
	},

	getFormData: (container) => ({
		email: container.querySelector('#signin-email')?.value.trim() ?? '',
		password: container.querySelector('#signin-password')?.value ?? ''
	}),

	setFeedback: (container, message, tone = 'info') => {
		const feedbackElement = container.querySelector('#signin-feedback');
		if (!feedbackElement) return;

		clearFeedbackClasses(feedbackElement);

		if (!message) {
			feedbackElement.textContent = '';
			feedbackElement.classList.add('is-hidden');
			return;
		}

		feedbackElement.classList.remove('is-hidden');
		feedbackElement.classList.add(`is-${tone}`);
		feedbackElement.textContent = message;
	},

	setSubmitting: (container, isSubmitting) => {
		const submitButton = container.querySelector('#signin-submit-btn');
		if (!submitButton) return;

		submitButton.disabled = isSubmitting;
		submitButton.textContent = isSubmitting ? 'Dang xu ly...' : 'Dang nhap';
	}
};
