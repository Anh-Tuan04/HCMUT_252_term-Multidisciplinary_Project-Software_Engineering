const clearFeedbackClasses = (feedbackElement) => {
	feedbackElement.classList.remove('is-success', 'is-error', 'is-warning', 'is-info');
};

export const ForgotPasswordPageView = {
	render: (container) => {
		container.innerHTML = `
			<div class="page-wrapper">
				<main class="recover-shell">
					<section class="recover-card">
						<p class="chip">Smart Parking</p>
						<h1 class="main-title">Quen mat khau</h1>
						<p class="sub-text">Nhap email de nhan ma xac nhan va tiep tuc dat lai mat khau.</p>

						<form class="form-container" id="forgot-form" novalidate>
							<div class="input-group">
								<label class="label-text" for="forgot-email">Nhap E-mail cua ban</label>
								<input id="forgot-email" type="email" class="input-field" placeholder="example@gmail.com" required>
							</div>

							<p class="auth-feedback is-hidden" id="forgot-feedback" aria-live="polite"></p>
							<p class="lookup-feedback is-hidden" id="forgot-lookup-feedback" aria-live="polite"></p>

							<div class="button-group">
								<button type="submit" class="btn btn-submit" id="forgot-submit-btn">Dat lai mat khau</button>
								<button type="button" class="btn btn-info" id="find-username-btn">Tim ten dang nhap bang E-mail</button>
								<a href="#/auth/login" class="btn btn-back">Quay lai</a>
							</div>
						</form>
					</section>
				</main>
			</div>
		`;
	},

	bindSubmit: (container, handler) => {
		const formElement = container.querySelector('#forgot-form');
		if (!formElement) return;

		formElement.addEventListener('submit', (event) => {
			handler(event);
		});
	},

	bindFindUsername: (container, handler) => {
		const buttonElement = container.querySelector('#find-username-btn');
		if (!buttonElement) return;

		buttonElement.addEventListener('click', () => {
			handler();
		});
	},

	getEmail: (container) => container.querySelector('#forgot-email')?.value.trim() ?? '',

	setFeedback: (container, message, tone = 'info') => {
		const feedbackElement = container.querySelector('#forgot-feedback');
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

	setLookupFeedback: (container, message, tone = 'info') => {
		const feedbackElement = container.querySelector('#forgot-lookup-feedback');
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
		const submitButton = container.querySelector('#forgot-submit-btn');
		if (!submitButton) return;

		submitButton.disabled = isSubmitting;
		submitButton.textContent = isSubmitting ? 'Dang xu ly...' : 'Dat lai mat khau';
	},

	setLookupLoading: (container, isLoading) => {
		const lookupButton = container.querySelector('#find-username-btn');
		if (!lookupButton) return;

		lookupButton.disabled = isLoading;
		lookupButton.textContent = isLoading ? 'Dang tim...' : 'Tim ten dang nhap bang E-mail';
	}
};
