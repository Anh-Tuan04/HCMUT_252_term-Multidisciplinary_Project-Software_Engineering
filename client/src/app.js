import Navigo from 'navigo';
import './shared/components/Global.css';
import AuthSessionService from './shared/services/AuthSessionService.js';

const router = new Navigo("/", { hash: true });
const appContainer = document.getElementById('app');

let currentController = null;

const renderRoute = async (importFactory) => {
    // Clean old controller
    if (currentController && currentController.cleanup) {
        currentController.cleanup();
    }

    // Load new page
    const module = await importFactory();
    const controller = Object.values(module)[0]; 
    
    currentController = controller;
    controller.init(appContainer, router);
};

const renderProtectedRoute = (importFactory) => {
    if (!AuthSessionService.isAuthenticated()) {
        router.navigate('/auth/login');
        return;
    }

    renderRoute(importFactory);
};

router
  .on('/', () => {
      router.navigate('/auth');
  })
  .on('/auth', () => {
      renderRoute(() => import('./features/AuthenticationPage/AuthenticationPage.controller.js'));
  })
  .on('/auth/login', () => {
      renderRoute(() => import('./features/AuthenticationPage/SignInPage/SignInPage.controller.js'));
  })
  .on('/auth/signup', () => {
      renderRoute(() => import('./features/AuthenticationPage/SignUpPage/SignUpPage.controller.js'));
  })
  .on('/auth/forgot', () => {
      renderRoute(() => import('./features/AuthenticationPage/ForgotPasswordPage/ForgotPasswordPage.controller.js'));
  })
  .on('/auth/reset/verify', () => {
      renderRoute(() => import('./features/AuthenticationPage/ResetPasswordPage/ResetPasswordPage.controller.js'));
  })
  .on('/auth/reset/password', () => {
      renderRoute(() => import('./features/AuthenticationPage/ResetPasswordPage/ResetPasswordPage.controller.js'));
  })
  .on('/map', () => {
      renderProtectedRoute(() => import('./features/MapPage/MapPage.controller.js'));
  })
  .on('/dashboard', () => {
      if (!AuthSessionService.isAuthenticated()) {
          router.navigate('/auth/login');
          return;
      }

      appContainer.innerHTML = '<h1>Dashboard</h1>';
      currentController = null;
  })
    .resolve();