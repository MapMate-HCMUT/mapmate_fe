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
1. **Tông màu chủ đạo:**
   * Xanh ngọc bích chính: `emerald-600` (`#059669`) / `emerald-500` (`#10B981`).
   * Cảnh báo ngập: `red-500` (`#EF4444`) / `amber-500` (`#F59E0B`).
   * Nền thẻ & card: `bg-white` bo góc `rounded-2xl` hoặc `rounded-xl`, đổ bóng mềm `shadow-sm` / `shadow-md`.
2. **Mobile-First Responsive:** Luôn đảm bảo hiển thị hoàn hảo trên màn hình hẹp (`max-w-md` hoặc `w-full md:max-w-4xl`).
3. **Đặt tên rõ nghĩa:**
   * Component: `PascalCase` (ví dụ: `FloodAlertCard.jsx`).
   * Custom Hook: `camelCase` bắt đầu bằng `use` (ví dụ: `useFloodAlert.js`).
   * Service API: `camelCase` (ví dụ: `getFloodAlertsApi.js`).
