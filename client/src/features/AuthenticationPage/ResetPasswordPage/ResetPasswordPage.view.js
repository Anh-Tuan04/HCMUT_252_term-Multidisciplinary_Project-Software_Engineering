const clearFeedbackClasses = (feedbackElement) => {
	feedbackElement.classList.remove('is-success', 'is-error', 'is-warning', 'is-info');
};

const formatDuration = (totalSeconds) => {
	const normalizedSeconds = Math.max(0, Number(totalSeconds) || 0);
	const minutes = String(Math.floor(normalizedSeconds / 60)).padStart(2, '0');
	const seconds = String(normalizedSeconds % 60).padStart(2, '0');
	return `${minutes}:${seconds}`;
};

const bindPasswordToggle = (container, buttonSelector, inputSelector, iconSelector) => {
	const buttonElement = container.querySelector(buttonSelector);
	const inputElement = container.querySelector(inputSelector);
	const iconElement = container.querySelector(iconSelector);

	if (!buttonElement || !inputElement || !iconElement) return;

	buttonElement.addEventListener('click', () => {
		const shouldShowPassword = inputElement.type === 'password';
		inputElement.type = shouldShowPassword ? 'text' : 'password';
		iconElement.textContent = shouldShowPassword ? 'Hide' : 'Show';
	});
};

export const ResetPasswordPageView = {
	renderVerificationStep: (container, email) => {
		container.innerHTML = `
			<div class="page-wrapper">
				<main class="recover-shell">
					<section class="recover-card">
						<p class="chip">Smart Parking</p>
						<h1 class="main-title">Dat lai mat khau</h1>
						<p class="sub-text">Nhap ma khoi phuc duoc gui trong email de tiep tuc dat lai mat khau.</p>
						${email ? `<p class="recovery-email">Email: <strong>${email}</strong></p>` : ''}

						<form class="form-container" id="verify-code-form" novalidate>
							<div class="input-group">
								<label class="label-text" for="verify-code-input">Nhap ma xac nhan</label>
								<input id="verify-code-input" type="text" class="input-field" placeholder="Vi du: 5dbf7f58-..." required>
							</div>

							<div class="timer-section">
								<p>Ma nay co hieu luc trong</p>
								<div class="countdown" id="verification-countdown">02:00</div>
								<button type="button" class="resend-btn" id="resend-code-btn">Gui lai ma</button>
							</div>

							<p class="auth-feedback is-hidden" id="reset-feedback" aria-live="polite"></p>

							<div class="button-group">
								<button type="submit" class="btn btn-submit" id="verify-code-submit-btn">Xac nhan</button>
								<a href="#/auth/forgot" class="btn btn-back">Quay lai</a>
							</div>
						</form>
					</section>
				</main>
			</div>
		`;
	},

	renderPasswordStep: (container, email) => {
		container.innerHTML = `
			<div class="page-wrapper">
				<main class="recover-shell">
					<section class="recover-card">
						<p class="chip">Smart Parking</p>
						<h1 class="main-title">Thiet lap mat khau moi</h1>
						<p class="sub-text">Nhap mat khau moi de hoan tat qua trinh khoi phuc tai khoan.</p>
						${email ? `<p class="recovery-email">Email: <strong>${email}</strong></p>` : ''}

						<form class="form-container" id="reset-password-form" novalidate>
							<div class="input-group">
								<label class="label-text" for="new-password">Nhap mat khau moi</label>
								<div class="password-box">
									<input type="password" class="input-field" id="new-password" placeholder="Mat khau moi" required>
									<button type="button" class="toggle-btn" id="toggle-new-password" aria-label="Hien thi mat khau moi">
										<span id="new-password-eye-icon">Show</span>
									</button>
								</div>
							</div>

							<div class="input-group">
								<label class="label-text" for="confirm-password">Xac nhan mat khau</label>
								<div class="password-box">
									<input type="password" class="input-field" id="confirm-password" placeholder="Nhap lai mat khau" required>
									<button type="button" class="toggle-btn" id="toggle-confirm-password" aria-label="Hien thi xac nhan mat khau">
										<span id="confirm-password-eye-icon">Show</span>
									</button>
								</div>
							</div>

							<p class="auth-feedback is-hidden" id="reset-feedback" aria-live="polite"></p>

							<div class="button-group">
								<button type="submit" class="btn btn-submit" id="reset-password-submit-btn">Dat lai mat khau</button>
								<a href="#/auth/reset/verify" class="btn btn-back">Quay lai</a>
							</div>
						</form>
					</section>
				</main>
			</div>
		`;
	},

	bindVerificationSubmit: (container, handler) => {
		const formElement = container.querySelector('#verify-code-form');
		if (!formElement) return;

		formElement.addEventListener('submit', (event) => {
			handler(event);
		});
	},

	bindResendCode: (container, handler) => {
		const buttonElement = container.querySelector('#resend-code-btn');
		if (!buttonElement) return;

		buttonElement.addEventListener('click', () => {
			handler();
		});
	},

	bindResetPasswordSubmit: (container, handler) => {
		const formElement = container.querySelector('#reset-password-form');
		if (!formElement) return;

		formElement.addEventListener('submit', (event) => {
			handler(event);
		});
	},

	bindPasswordToggles: (container) => {
		bindPasswordToggle(container, '#toggle-new-password', '#new-password', '#new-password-eye-icon');
		bindPasswordToggle(container, '#toggle-confirm-password', '#confirm-password', '#confirm-password-eye-icon');
	},

	getVerificationCode: (container) => container.querySelector('#verify-code-input')?.value.trim() ?? '',

	getPasswordFormData: (container) => ({
		newPassword: container.querySelector('#new-password')?.value ?? '',
		confirmPassword: container.querySelector('#confirm-password')?.value ?? ''
	}),

	setFeedback: (container, message, tone = 'info') => {
		const feedbackElement = container.querySelector('#reset-feedback');
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

	setSubmitting: (container, isSubmitting, mode) => {
		if (mode === 'password') {
			const submitButton = container.querySelector('#reset-password-submit-btn');
			if (!submitButton) return;

			submitButton.disabled = isSubmitting;
			submitButton.textContent = isSubmitting ? 'Dang xu ly...' : 'Dat lai mat khau';
			return;
		}

		const verifyButton = container.querySelector('#verify-code-submit-btn');
		const resendButton = container.querySelector('#resend-code-btn');

		if (verifyButton) {
			verifyButton.disabled = isSubmitting;
			verifyButton.textContent = isSubmitting ? 'Dang kiem tra...' : 'Xac nhan';
		}

		if (resendButton) {
			resendButton.disabled = isSubmitting;
			resendButton.textContent = isSubmitting ? 'Dang gui...' : 'Gui lai ma';
		}
	},

	setCountdown: (container, remainingSeconds, isExpired) => {
		const countdownElement = container.querySelector('#verification-countdown');
		if (!countdownElement) return;

		countdownElement.textContent = formatDuration(remainingSeconds);
		countdownElement.classList.toggle('is-expired', Boolean(isExpired));
	}
};
