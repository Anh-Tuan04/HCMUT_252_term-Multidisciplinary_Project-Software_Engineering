import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'
import { setAccessToken } from '../../utils/axiosInterceptor'
import '../../styles/auth-pages.css'

const initialForm = {
	email: '',
	password: '',
}

function Login() {
	const navigate = useNavigate()
	const [form, setForm] = useState(initialForm)
	const [showPassword, setShowPassword] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [feedback, setFeedback] = useState({ type: '', message: '' })

	const handleChange = (event) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setFeedback({ type: '', message: '' })

		if (!form.email || !form.password) {
			setFeedback({
				type: 'is-error',
				message: 'Vui lòng nhập đầy đủ email và mật khẩu.',
			})
			return
		}

		setIsSubmitting(true)
		try {
			const response = await login({
				email: form.email,
				password: form.password,
			})
			const apiData = response?.data
			if (apiData?.success) {
				const accessToken = apiData?.data?.access_token
				const userInfo = apiData?.data?.user

				if (!accessToken) {
					setFeedback({
						type: 'is-error',
						message: 'Thiếu access token từ server, vui lòng thử lại.',
					})
					return
				}
				setAccessToken(accessToken)
				// Lưu thông tin người dùng vào localStorage
				if (userInfo) {
					localStorage.setItem('user_info', JSON.stringify(userInfo))
				}
				setFeedback({ type: 'is-success', message: apiData.message || 'Đăng nhập thành công.' })
				navigate('/map')
				return
			}

			setFeedback({
				type: 'is-error',
				message: apiData?.message || 'Đăng nhập thất bại, vui lòng thử lại.',
			})
		} catch (error) {
			const serverErrors = error?.response?.data?.errors
			const serverMessage = error?.response?.data?.message
			setFeedback({
				type: 'is-error',
				message:
					(Array.isArray(serverErrors) && serverErrors[0]) ||
					serverMessage ||
					'Không thể đăng nhập, vui lòng thử lại.',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="auth-page auth-signin-page">
			<div className="page-wrapper">
				<section className="auth-card">
					<span className="chip">Smart Parking</span>
					<h1 className="login-header">Đăng nhập hệ thống</h1>
					<p className="desc">
						Nhập thông tin tài khoản để xem sơ đồ bãi đỗ và quản lý hoạt động.
					</p>
					<form className="auth-form" onSubmit={handleSubmit}>
						<div className="input-group">
							<label className="label-text" htmlFor="login-email">
								Email
							</label>
							<input
								id="login-email"
								name="email"
								type="email"
								className="input-field"
								placeholder="name@email.com"
								value={form.email}
								onChange={handleChange}
								autoComplete="email"
								required
							/>
						</div>
						<div className="input-group">
							<label className="label-text" htmlFor="login-password">
								Mật khẩu
							</label>
							<div className="password-box">
								<input
									id="login-password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									className="input-field"
									placeholder="Nhap mat khau"
									placeholder="Nhập mật khẩu"
									value={form.password}
									onChange={handleChange}
									autoComplete="current-password"
									required
								/>
								<button
									type="button"
									className="toggle-btn"
									onClick={() => setShowPassword((prev) => !prev)}
								>
									{showPassword ? 'Ẩn' : 'Hiện'}
								</button>
							</div>
						</div>
						<Link className="forgot-link" to="/forgot-password">
							Quên mật khẩu?
						</Link>
						<p
							className={`auth-feedback ${
								feedback.message ? feedback.type : 'is-hidden'
							}`}
						>
							{feedback.message || 'Không có thông báo'}
						</p>
						<div className="button-group">
							<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
							</button>
							<Link className="btn btn-back" to="/register">
								Tạo tài khoản mới
							</Link>
							<Link className="btn btn-back" to="/">
								Quay lại trang chủ
							</Link>
						</div>
					</form>
				</section>
			</div>
		</div>
	)
}

export default Login
