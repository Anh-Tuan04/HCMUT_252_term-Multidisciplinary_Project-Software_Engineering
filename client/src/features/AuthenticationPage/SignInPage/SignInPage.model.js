import { AuthApi, buildLoginRequest } from '../AuthenticationPage.model.js';

export const SignInPageModel = {
	createLoginRequest: ({ email, password }) => buildLoginRequest({ email, password }),
	submitLogin: (request) => AuthApi.login(request)
};
