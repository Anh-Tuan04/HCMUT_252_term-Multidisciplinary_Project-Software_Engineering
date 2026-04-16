import './AuthenticationPage.css';
import { AuthenticationPageView } from './AuthenticationPage.view.js';

export const AuthenticationPageController = {
	init: (container) => {
		AuthenticationPageView.render(container);
	},

	cleanup: () => {
		// No side effects to clean up for this page.
	}
};
