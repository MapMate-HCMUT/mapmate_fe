# 🤖 AGENT GUIDELINES — FRONTEND ARCHITECTURE (`mapmate_fe`)

> **Mục tiêu:** Bản quy chuẩn phát triển mã nguồn Frontend bắt buộc dành cho AI Agent và Developer của dự án **MapMate**.  
> **Kiến trúc:** **Bulletproof React (Feature-Driven Architecture)** kết hợp nguyên lý **Container / Presenter Pattern** và **Custom Hooks**.

---

## 📂 1. CẤU TRÚC THƯ MỤC TỔNG THỂ (ROOT TREE)

Mọi mã nguồn Frontend trong `mapmate_fe/` bắt buộc phải tuân theo cấu trúc chuẩn sau:

```
mapmate_fe/
├── public/                 # Tài nguyên tĩnh công khai (favicon, manifest, geojson mẫu)
├── src/
│   ├── app/                # Root app setup, Main Layout, Error Boundary
│   ├── assets/             # Hình ảnh tĩnh, SVG Icons, Fonts
│   ├── components/         # CÁC UI COMPONENT DÙNG CHUNG TOÀN ỨNG DỤNG (Button, Modal, Input, Spinner...)
│   ├── config/             # Hằng số môi trường (API_URL, GOONG_MAP_KEY, MAP_DEFAULT_CENTER)
│   ├── features/           # CÁC MODULE TÍNH NĂNG CHÍNH CỦA HỆ THỐNG (Chia theo Domain)
│   │   ├── auth/           # Đăng nhập, Đăng ký, Quản lý Token
│   │   ├── ai-planner/     # Chatbot AI gợi ý lịch trình, Prompting, Lịch sử phiên chat
│   │   ├── map/            # Bản đồ Goong Maps nền, Quản lý Marker POI, Tương tác không gian
│   │   ├── itinerary/      # Điều hướng lộ trình, Quản lý trạm dừng đa điểm, Timeline
│   │   ├── flood-alert/    # Cảnh báo ngập thời gian thực, Lớp vẽ vùng ngập, Né ngập
│   │   ├── community/      # Báo cáo sự cố đô thị nhanh (ảnh + GPS), Bảng tin ngập
│   │   └── gamification/   # Check-in trạm dừng, Tích điểm XP, Huy hiệu, Bảng xếp hạng
│   ├── lib/                # Cấu hình thư viện bên thứ 3 (Axios client, MapLibre SDK, Dayjs)
│   ├── mocks/              # Mock data phục vụ kiểm thử giao diện
│   ├── providers/          # React Context Providers (QueryProvider, AuthProvider, ThemeProvider)
│   ├── routes/             # Khởi tạo React Router (AppRoutes, ProtectedRoute)
│   ├── stores/             # Global State Stores (Zustand / Context toàn cục)
│   ├── types/              # Type definitions / TypeScript interfaces
│   ├── utils/              # Hàm tiện ích dùng chung (formatCurrencyVNĐ, calculateDistance)
│   └── main.jsx (hoặc .tsx)# Điểm khởi chạy ứng dụng (Entry point)
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── AGENT.md                # File hướng dẫn này
```

---

## 🧩 2. QUY CHUẨN BẮT BUỘC TRONG TỪNG FEATURE (`src/features/[feature-name]/`)

Mỗi thư mục tính năng (Feature) là một module độc lập, tự chứa (Self-contained) và **BẮT BUỘC PHẢI CHIA ĐỦ 5 THÀNH PHẦN SAU**:

```
src/features/ai-planner/
├── api/                    # 1. Gọi API Backend (Axios fetchers, React Query mutation/query)
│   ├── generatePlan.js
│   └── getAiSessions.js
├── components/             # 2. Các UI Component chia nhỏ (CHỈ LÀM NHIỆM VỤ RENDER GIAO DIỆN)
│   ├── ChatHeader.jsx
│   ├── ChatMessageList.jsx
│   ├── ChatInputBar.jsx
│   ├── ItineraryPreviewCard.jsx
│   └── StopItemRow.jsx
├── hooks/                  # 3. CHỨA 100% BUSINESS LOGIC, STATE & EVENT HANDLERS
│   ├── useAiPlanner.js
│   └── useChatScroll.js
├── stores/                 # 4. State riêng của feature (nếu cần quản lý cục bộ)
│   └── aiPlannerStore.js
├── utils/                  # 5. Hàm tính toán/format riêng cho feature này
│   └── parseAiResponse.js
└── index.js (hoặc .ts)     # 6. Barrel file export các component/hook public ra ngoài
```

---

## ⚡ 3. NGUYÊN TẮC BẤT DI BẤT DỊCH (CRITICAL CODING RULES)

### 🔴 QUY TẮC 1: TUYỆT ĐỐI KHÔNG ĐƯỢC VIẾT LOGIC TRONG PHẦN UI (Zero Logic in UI)
* **UI Component (`components/`) CHỈ LÀ "KHUNG TRƯNG BÀY" (Pure Presentational Component):**
  * Nhiệm vụ duy nhất: Nhận `props`, gắn class `TailwindCSS` và hiển thị ra màn hình.
  * **CẤM:** Gọi `axios`, `fetch()`, viết `useEffect` fetch dữ liệu, tính toán thuật toán phức tạp trực tiếp trong thân Component UI.
* **Mọi Logic phải nằm trong Custom Hook (`hooks/`):**
  * Toàn bộ `useState`, `useEffect`, `useCallback`, logic xử lý nút bấm (`handleSubmit`, `handleCheckIn`), gọi API phải được gom vào Custom Hook.
  * Component UI chỉ việc lấy ra dùng:
  
```jsx
// ❌ SAI (Anti-pattern: Viết logic lộn xộn trong UI):
export const AiChatBox = () => {
  const [msg, setMsg] = useState('');
  useEffect(() => { axios.get('/api/ai/sessions').then(...) }, []); // CẤM VIẾT Ở ĐÂY
  const handleSend = async () => { ... logic dài 50 dòng ... };
  return <div>...</div>;
};

// ✅ ĐÚNG (Clean Code chuẩn MapMate):
// Trong file: src/features/ai-planner/components/AiChatBox.jsx
import { useAiPlanner } from '../hooks/useAiPlanner';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputBar } from './ChatInputBar';

export const AiChatBox = () => {
  // Toàn bộ logic được trừu tượng hóa sạch sẽ qua Hook
  const { messages, isLoading, handleSendMessage } = useAiPlanner();

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg">
      <ChatMessageList messages={messages} isLoading={isLoading} />
      <ChatInputBar onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};
```

---

### 🔴 QUY TẮC 2: PHẢI TÁCH THÀNH NHIỀU COMPONENT NHỎ (Component Decomposition)
1. **Quy tắc Single Responsibility (Đơn nhiệm):** Một component chỉ làm đúng một việc duy nhất.
2. **Giới hạn độ dài file:** Một file component **KHÔNG ĐƯỢC vượt quá 120 - 150 dòng code**. Nếu dài hơn, bắt buộc phải tách thành các sub-components con đặt trong thư mục `components/` của feature đó.
3. **Ví dụ tách màn hình Bản đồ:**
   * Thay vì viết cả file `MapPage.jsx` dài 800 dòng:
   * Hãy tách thành:
     * `MapContainer.jsx` (Khung bản đồ Goong)
     * `FloodWarningMarkers.jsx` (Các điểm ngập)
     * `ActiveRoutePolyline.jsx` (Vẽ đường xanh)
     * `NavigationBottomSheet.jsx` (Thanh điều hướng dưới đáy)
     * `CheckInRewardModal.jsx` (Popup chúc mừng nhận XP)

---

### 🔴 QUY TẮC 3: CLEAN CODE & GIAO DIỆN CHUẨN BRANDING

#### 🎨 3.1 BẢNG MÃ MÀU TAILWIND DESIGN TOKENS (BẮT BUỘC SỬ DỤNG)

Dự án MapMate sử dụng **Tailwind CSS v4** với hệ thống Design Token tùy chỉnh. Mọi component BẮT BUỘC dùng đúng token class dưới đây, **KHÔNG ĐƯỢC** dùng mã hex cứng hoặc class Tailwind mặc định (ví dụ: `bg-emerald-600`).

File cấu hình: `src/index.css` → `@theme { ... }`

| Semantic Token | Tailwind Class | Hex | Mục đích sử dụng |
|---|---|---|---|
| **Primary** (Emerald) | `bg-primary-600`, `text-primary-700`, `border-primary-500` | `#059669` | Nút chính, Header, Navigation bar, Link hoạt động, Brand color |
| **Primary Light** | `bg-primary-100`, `text-primary-800` | `#d1fae5` | Badge tag, Chip trạng thái, Nền nhẹ |
| **Secondary** (Teal) | `bg-secondary-500`, `text-secondary-700` | `#14b8a6` | Bản đồ POI marker, Polyline route, Layer |
| **Accent** (Amber) | `bg-accent-500`, `text-accent-700` | `#f59e0b` | Nút CTA phụ, XP Reward, Star rating, Gamification highlight |
| **Danger** (Red) | `bg-danger-500`, `text-danger-700` | `#ef4444` | Cảnh báo ngập nặng, Vùng nguy hiểm, Lỗi validation |
| **Warning** (Orange) | `bg-warning-500`, `text-warning-700` | `#f97316` | Cảnh báo ngập trung bình, Lưu ý, Flash message |
| **Success** (Green) | `bg-success-500`, `text-success-700` | `#22c55e` | Check-in thành công, Route an toàn, Toast thành công |
| **Info** (Sky) | `bg-info-500`, `text-info-700` | `#0ea5e9` | AI Chat bubble bot, Tooltip, Thông báo hướng dẫn |
| **Neutral** (Slate) | `bg-neutral-100`, `text-neutral-800` | `#f1f5f9` / `#1e293b` | Nền trang, Text body, Border, Placeholder |
| **Surface** | `bg-surface`, `hover:bg-surface-hover` | `#ffffff` | Card, Modal, Drawer, Bottom Sheet |

#### 🎨 3.2 QUY TẮC ÁP DỤNG MÀU THEO DOMAIN

| Domain / Feature | Primary Color | Accent Color | Ghi chú |
|---|---|---|---|
| **Header / Navbar** | `bg-primary-600 text-white` | — | Luôn dùng primary emerald |
| **AI Chatbot** | `bg-primary-500` (bot bubble) | `bg-info-100` (user bubble) | Bot = Primary, User = Info |
| **Flood Alert** | `bg-danger-500` (ngập nặng) | `bg-warning-400` (ngập vừa) | Dựa theo `severity` field |
| **Gamification XP** | `bg-accent-500` (XP badge) | `bg-success-500` (check-in) | Vàng cam cho phần thưởng |
| **Map Route** | `text-secondary-600` (polyline) | `text-danger-500` (vùng ngập) | Teal cho route, Red cho flood zone |
| **Card / Modal** | `bg-surface rounded-card shadow-card` | — | Luôn dùng Surface token |
| **Button Primary** | `bg-primary-600 hover:bg-primary-700 text-white rounded-button` | — | Nút hành động chính |
| **Button Secondary** | `bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-button` | — | Nút phụ / Ghost |
| **Input / Select** | `border-neutral-300 focus:border-primary-500 focus:ring-primary-500 rounded-input` | — | Viền mặc định neutral |

#### 🎨 3.3 QUY TẮC BORDER RADIUS & SHADOW
* **Card chính:** `rounded-card shadow-card` → `border-radius: 1rem`
* **Button:** `rounded-button` → `border-radius: 0.75rem`
* **Pill / Tag / Badge:** `rounded-pill` → `border-radius: 9999px`
* **Input / Select:** `rounded-input` → `border-radius: 0.5rem`
* **Hover card:** `hover:shadow-card-hover transition-shadow`
* **Modal overlay:** `shadow-modal`

#### 🎨 3.4 TYPOGRAPHY
* **Font chính:** `font-sans` → Inter, system-ui
* **Font code:** `font-mono` → JetBrains Mono, Consolas
* **Heading:** `font-bold tracking-tight text-neutral-900`
* **Body text:** `text-neutral-700` (light bg) hoặc `text-neutral-300` (dark bg)
* **Caption / Muted:** `text-neutral-500 text-sm`

---

### 🔴 QUY TẮC 4: MOBILE-FIRST RESPONSIVE
1. **Mobile-First:** Luôn đảm bảo hiển thị hoàn hảo trên màn hình hẹp trước (`w-full`), sau đó mở rộng cho desktop (`md:max-w-4xl`, `lg:max-w-7xl`).
2. **Breakpoints chuẩn Tailwind:** `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`.

---

### 🔴 QUY TẮC 5: QUY ƯỚC ĐẶT TÊN
1. **Component:** `PascalCase` (ví dụ: `FloodAlertCard.jsx`).
2. **Custom Hook:** `camelCase` bắt đầu bằng `use` (ví dụ: `useFloodAlert.js`).
3. **Service API:** `camelCase` (ví dụ: `getFloodAlertsApi.js`).
4. **Folder feature:** `kebab-case` (ví dụ: `flood-alert/`, `ai-planner/`).
