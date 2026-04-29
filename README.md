# Smart Parking Frontend (React + Vite + TypeScript)

Ứng dụng frontend cho hệ thống quản lý bãi xe thông minh, xây dựng với React 19, Vite 8, và TypeScript.

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: Phiên bản 18.0.0 trở lên
- **npm** hoặc **yarn**: Trình quản lý gói (npm thường được cài sẵn cùng Node.js)
- **Git**: Để clone repository (tuỳ chọn)

## 🚀 Cách Chạy Frontend

### 1. **Cài Đặt Dependencies**

Mở terminal/command prompt tại thư mục `client` và chạy:

```bash
npm install
```

Hoặc nếu dùng yarn:

```bash
yarn install
```

### 2. **Chạy Dev Server**

Sau khi cài đặt xong, chạy lệnh:

```bash
npm run dev
```

Hoặc với yarn:

```bash
yarn dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### 3. **Build cho Production**

Để tạo bản production:

```bash
npm run build
```

Output sẽ được lưu tại thư mục `dist/`

## 🎯 Các Lệnh Hữu Ích

```bash
# Kiểm tra lint (ESLint)
npm run lint

# Format code (nếu có)
npm run format

# Chạy tests (nếu có)
npm run test
```

## 🔧 Cấu Hình Backend

Frontend kết nối tới backend API. Đảm bảo backend đang chạy tại cổng **8080**:

- **API Server**: `http://localhost:8080`
- **WebTransport**: `ws://localhost:8443` (realtime updates)

Nếu backend chạy ở địa chỉ khác, chỉnh sửa file [src/constants/apiConfig.ts](src/constants/apiConfig.ts)

## 📁 Cấu Trúc Thư Mục

```
client/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React Context (Auth, etc.)
│   ├── services/         # API & utility services
│   ├── styles/           # CSS stylesheets
│   ├── types/            # TypeScript types
│   ├── assets/           # Images, icons, etc.
│   ├── App.tsx           # Main App component
│   └── index.tsx         # Entry point
├── package.json
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint rules
└── index.html            # HTML template
```

## 🛠️ Technology Stack

- **React 19.2.5** - UI library
- **Vite 8.0.10** - Build tool & dev server
- **TypeScript** - Type-safe JavaScript
- **CSS** - Styling (no framework)

## 📝 Ghi Chú

- Hot Module Replacement (HMR) được bật mặc định, code thay đổi sẽ tự cập nhật trong browser
- ESLint được cấu hình để kiểm tra chất lượng code
- Hỗ trợ TypeScript strict mode

## ❓ Có Vấn Đề?

1. **Lỗi "port 5173 already in use"**: Cổng 5173 đang được sử dụng. Chạy lệnh:

   ```bash
   npm run dev -- --port 3000
   ```

   để chạy ở cổng khác

2. **Lỗi về dependencies**: Xoá folder `node_modules` và chạy lại `npm install`

3. **Backend không kết nối**: Kiểm tra API config và đảm bảo backend đang chạy
