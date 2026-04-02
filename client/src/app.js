import Navigo from 'navigo';
import './shared/components/Global.css';

const router = new Navigo("/", { hash: true });
const appContainer = document.getElementById('app');

// Biến lưu controller hiện tại để dọn dẹp
let currentController = null;

const renderRoute = async (importFactory) => {
    // 1. Dọn dẹp trang cũ
    if (currentController && currentController.cleanup) {
        currentController.cleanup();
    }

    // 2. Tải trang mới
    const module = await importFactory();
    const controller = Object.values(module)[0]; 
    
    currentController = controller;
    controller.init(appContainer, router);
};

router
  .on('/', () => {
      renderRoute(() => import('./features/MapPage/MapPage.controller.js'));
  })
  .on('/map', () => {
      renderRoute(() => import('./features/MapPage/MapPage.controller.js'));
  })
  .on('/dashboard', () => {
      appContainer.innerHTML = '<h1>Dashboard</h1>';
      currentController = null; // Reset nếu trang này chưa có controller
  })
    .resolve();