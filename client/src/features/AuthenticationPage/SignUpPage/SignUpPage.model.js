import { AuthApi, buildSignUpRequest } from '../AuthenticationPage.model.js';

export const SignUpPageModel = {
	createSignUpRequest: ({ firstName, lastName, username, email, password, role }) => (
		buildSignUpRequest({ firstName, lastName, username, email, password, role })
	),
	submitSignUp: (request) => AuthApi.signUp(request)
};
