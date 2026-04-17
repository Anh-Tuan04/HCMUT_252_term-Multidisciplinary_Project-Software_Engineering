const clearFeedbackClasses = (feedbackElement) => {
	feedbackElement.classList.remove('is-success', 'is-error', 'is-warning', 'is-info');
};

export const SignUpPageView = {
	render: (container) => {
		container.innerHTML = `
			<div class="page-wrapper">
				<main class="signup-shell">
					<section class="signup-card">
						<p class="chip">Smart Parking</p>
						<h2 class="signup-header">Dang ky tai khoan</h2>
						<p class="desc">Tao tai khoan de su dung day du tinh nang dat cho va quan ly xe.</p>

						<form class="form-container" id="signup-form" novalidate>
							<div class="split-row">
								<div class="input-group">
									<label class="label-text" for="signup-first-name">Ten</label>
									<input id="signup-first-name" class="input-field" type="text" placeholder="Nhap ten" required>
								</div>

								<div class="input-group">
									<label class="label-text" for="signup-last-name">Ho</label>
									<input id="signup-last-name" class="input-field" type="text" placeholder="Nhap ho" required>
								</div>
							</div>

							<div class="input-group">
								<label class="label-text" for="signup-email">E-mail</label>
								<input id="signup-email" class="input-field" type="email" placeholder="example@mail.com" required>
							</div>

							<div class="input-group">
								<label class="label-text" for="signup-username">Ten nguoi dung</label>
								<input id="signup-username" class="input-field" type="text" placeholder="Username" required>
							</div>

							<div class="input-group">
								<label class="label-text" for="signup-password">Mat khau</label>
								<div class="password-box">
									<input type="password" id="signup-password" class="input-field" placeholder="Mat khau" required>
									<button type="button" class="toggle-btn" id="signup-toggle-password" aria-label="Hien thi mat khau">
										<span id="signup-eye-icon">Show</span>
									</button>
								</div>
							</div>

							<div class="input-group role-group">
								<label class="label-text" for="signup-role">Chon vai tro cua ban</label>
								<select id="signup-role" class="input-field select-field">
									<option value="user">Nguoi dung thuong</option>
									<option value="manager">Quan ly bai xe</option>
								</select>
							</div>

							<p class="auth-feedback is-hidden" id="signup-feedback" aria-live="polite"></p>

							<div class="button-group">
								<button type="submit" class="btn btn-submit" id="signup-submit-btn">Dang ky</button>
								<a href="#/auth" class="btn btn-back">Quay lai</a>
							</div>
						</form>
					</section>
				</main>
			</div>
		`;
	},

	bindSubmit: (container, handler) => {
		const formElement = container.querySelector('#signup-form');
		if (!formElement) return;

		formElement.addEventListener('submit', (event) => {
			handler(event);
		});
	},

	bindPasswordToggle: (container) => {
		const passwordInput = container.querySelector('#signup-password');
		const iconElement = container.querySelector('#signup-eye-icon');
		const toggleButton = container.querySelector('#signup-toggle-password');

		if (!passwordInput || !iconElement || !toggleButton) return;

		toggleButton.addEventListener('click', () => {
			const shouldShowPassword = passwordInput.type === 'password';
			passwordInput.type = shouldShowPassword ? 'text' : 'password';
			iconElement.textContent = shouldShowPassword ? 'Hide' : 'Show';
		});
	},

	getFormData: (container) => ({
		firstName: container.querySelector('#signup-first-name')?.value.trim() ?? '',
		lastName: container.querySelector('#signup-last-name')?.value.trim() ?? '',
		username: container.querySelector('#signup-username')?.value.trim() ?? '',
		email: container.querySelector('#signup-email')?.value.trim() ?? '',
		password: container.querySelector('#signup-password')?.value ?? '',
		role: container.querySelector('#signup-role')?.value ?? 'user'
	}),

	setFeedback: (container, message, tone = 'info') => {
		const feedbackElement = container.querySelector('#signup-feedback');
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
		const submitButton = container.querySelector('#signup-submit-btn');
		if (!submitButton) return;

		submitButton.disabled = isSubmitting;
		submitButton.textContent = isSubmitting ? 'Dang xu ly...' : 'Dang ky';
	}
};
