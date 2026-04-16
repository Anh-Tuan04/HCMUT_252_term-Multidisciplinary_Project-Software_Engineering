import { AuthApi, buildForgotPasswordRequest } from '../AuthenticationPage.model.js';

export const ForgotPasswordPageModel = {
	createForgotPasswordRequest: ({ email }) => buildForgotPasswordRequest({ email }),
	submitForgotPassword: (request) => AuthApi.forgotPassword(request),
	findUsernameByEmail: (email) => AuthApi.findUsernameByEmail(email)
};
