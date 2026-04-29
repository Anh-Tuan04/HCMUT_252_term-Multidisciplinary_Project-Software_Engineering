import { useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

interface SignUpPageProps {
  navigate: (path: string) => void;
}

export const SignUpPage = ({ navigate }: SignUpPageProps) => {
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "manager">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tone, setTone] = useState<"info" | "success" | "warning" | "error">(
    "info",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      setFeedback("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      setTone("warning");
      return;
    }

    if (password.length < 6) {
      setFeedback("Mật khẩu phải có ít nhất 6 ký tự.");
      setTone("warning");
      return;
    }

    setIsSubmitting(true);
    setFeedback("Đang tạo tài khoản...");
    setTone("info");

    const result = await signUp({
      firstName,
      lastName,
      username,
      email,
      password,
      role,
    });

    if (!result.success) {
      setFeedback(result.message || "Đăng ký thất bại");
      setTone("error");
      setIsSubmitting(false);
      return;
    }

    setFeedback(
      "Đăng ký thành công. Vui lòng kiểm tra email để xác thực trước khi đăng nhập.",
    );
    setTone("success");

    window.setTimeout(() => {
      navigate("/auth/login");
    }, 700);

    setIsSubmitting(false);
  };

  return (
    <div className="auth-page auth-signup-page">
      <div className="auth-top-actions">
        <button
          type="button"
          className="auth-map-btn"
          onClick={() => navigate("/map")}
        >
          Back to map
        </button>
      </div>
      <div className="page-wrapper">
        <main className="signup-shell">
          <section className="signup-card">
            <p className="chip">Smart Parking</p>
            <h2 className="signup-header">Đăng ký tài khoản</h2>
            <p className="desc">
              Tạo tài khoản để sử dụng đầy đủ tính năng đặt chỗ và quản lý xe.
            </p>

            <form className="form-container" onSubmit={submit} noValidate>
              <div className="split-row">
                <div className="input-group">
                  <label className="label-text" htmlFor="signup-first-name">
                    Tên
                  </label>
                  <input
                    id="signup-first-name"
                    className="input-field"
                    type="text"
                    placeholder="Nhập tên"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="label-text" htmlFor="signup-last-name">
                    Họ
                  </label>
                  <input
                    id="signup-last-name"
                    className="input-field"
                    type="text"
                    placeholder="Nhập họ"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="label-text" htmlFor="signup-email">
                  E-mail
                </label>
                <input
                  id="signup-email"
                  className="input-field"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label-text" htmlFor="signup-username">
                  Tên người dùng
                </label>
                <input
                  id="signup-username"
                  className="input-field"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label-text" htmlFor="signup-password">
                  Mật khẩu
                </label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signup-password"
                    className="input-field"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword((previous) => !previous)}
                  >
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              <div className="input-group role-group">
                <label className="label-text" htmlFor="signup-role">
                  Chọn vai trò của bạn
                </label>
                <select
                  id="signup-role"
                  className="input-field select-field"
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target.value === "manager" ? "manager" : "user",
                    )
                  }
                >
                  <option value="user">Người dùng thường</option>
                  <option value="manager">Quản lý bãi xe</option>
                </select>
              </div>

              <p className="signup-note">
                Role tạo mới hiện đang do server cấp mặc định USER. Role
                admin/manager được cấp bởi quản trị viên.
              </p>

              <p
                className={`auth-feedback ${feedback ? `is-${tone}` : "is-hidden"}`}
              >
                {feedback || "feedback"}
              </p>

              <div className="button-group">
                <button
                  type="submit"
                  className="btn btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
                </button>
                <button
                  type="button"
                  className="btn btn-back"
                  onClick={() => navigate("/auth")}
                >
                  Quay lại
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};
