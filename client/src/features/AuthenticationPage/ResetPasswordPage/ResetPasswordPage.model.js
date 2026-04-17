import {
	AuthApi,
	VerificationCodeStatus,
	buildForgotPasswordRequest,
	buildVerificationCodeRequest,
	buildResetPasswordRequest
} from '../AuthenticationPage.model.js';

export const ResetPasswordPageModel = {
	VerificationCodeStatus,
	getRecoveryContext: () => AuthApi.getRecoveryContext(),
	createVerificationCodeRequest: ({ email, code }) => buildVerificationCodeRequest({ email, code }),
	submitVerificationCode: (request) => AuthApi.verifyCode(request),
	resendVerificationCode: (email) => AuthApi.forgotPassword(buildForgotPasswordRequest({ email })),
	createResetPasswordRequest: ({ email, newPassword, code, confirmPassword }) => (
		buildResetPasswordRequest({ email, newPassword, code, confirmPassword })
	),
	submitResetPassword: (request) => AuthApi.resetPassword(request)
};
