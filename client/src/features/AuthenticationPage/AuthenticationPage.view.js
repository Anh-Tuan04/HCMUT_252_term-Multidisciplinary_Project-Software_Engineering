export const AuthenticationPageView = {
	render: (container) => {
		container.innerHTML = `
			<div class="page-wrapper">
				<main class="hero-card">
					<p class="badge">Smart Parking Platform</p>
					<h1 class="main-title">Chao mung den voi Smart Parking website</h1>
					<p class="main-subtitle">He thong quan ly bai xe truc quan, nhanh gon va toi uu trai nghiem cho ban.</p>

					<div class="action-group">
						<a href="#/auth/login" class="btn btn-primary">Dang nhap</a>
						<a href="#/auth/signup" class="btn btn-secondary">Dang ky</a>
					</div>

					<p class="signup-text">Ban chua co tai khoan? Dang ky ngay de bat dau.</p>
				</main>
			</div>
		`;
	}
};
