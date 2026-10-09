// Lỗi -> lời giải thích người dùng bình thường hiểu được (không "Network Error", "status code 500", "API key"...).
// Lỗi làm cả trang không dùng được (mất mạng, máy chủ sập, bản đồ không tải, trang không tồn tại, giao diện hỏng)
// => chuyển sang trang lỗi riêng (/loi). Lỗi của 1 thao tác nhỏ (lưu, ghim, gửi...) => thông báo ngắn tại chỗ.

export const ERROR_KINDS = {
  OFFLINE: 'offline',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  RATE_LIMIT: 'rate_limit',
  NOT_FOUND: 'not_found',
  MAP: 'map',
  CRASH: 'crash',
  REQUEST: 'request', // lỗi do dữ liệu gửi lên (4xx) — backend đã viết sẵn lời nhắn dễ hiểu
};

// Nội dung trang lỗi: chuyện gì xảy ra + bạn nên làm gì
export const ERROR_PAGES = {
  [ERROR_KINDS.OFFLINE]: {
    emoji: '📡',
    title: 'Không kết nối được tới MapMate',
    message: 'Có vẻ thiết bị của bạn đang mất mạng hoặc mạng chập chờn.',
    tips: ['Kiểm tra Wi‑Fi hoặc 4G/5G', 'Tắt chế độ máy bay nếu đang bật', 'Bấm "Thử lại" khi đã có mạng'],
  },
  [ERROR_KINDS.SERVER]: {
    emoji: '🛠️',
    title: 'MapMate đang gặp trục trặc',
    message: 'Máy chủ của MapMate tạm thời không phản hồi. Lỗi nằm ở phía MapMate, không phải do bạn.',
    tips: ['Đợi 1–2 phút rồi bấm "Thử lại"', 'Nếu vẫn lỗi, quay lại sau ít phút'],
  },
  [ERROR_KINDS.TIMEOUT]: {
    emoji: '⏳',
    title: 'MapMate phản hồi quá chậm',
    message: 'Yêu cầu mất quá nhiều thời gian nên đã bị dừng — có thể do mạng yếu hoặc máy chủ đang đông.',
    tips: ['Kiểm tra lại mạng', 'Bấm "Thử lại"'],
  },
  [ERROR_KINDS.RATE_LIMIT]: {
    emoji: '✋',
    title: 'Bạn thao tác hơi nhanh',
    message: 'MapMate nhận quá nhiều yêu cầu cùng lúc từ bạn nên tạm chặn trong giây lát để bảo vệ hệ thống.',
    tips: ['Đợi khoảng 1 phút rồi thử lại'],
  },
  [ERROR_KINDS.NOT_FOUND]: {
    emoji: '🧭',
    title: 'Không tìm thấy trang này',
    message: 'Đường dẫn có thể đã bị gõ sai, hoặc nội dung này đã bị xoá.',
    tips: ['Kiểm tra lại đường dẫn', 'Quay về trang chủ để tìm tiếp'],
  },
  [ERROR_KINDS.MAP]: {
    emoji: '🗺️',
    title: 'Không tải được bản đồ',
    message: 'Dịch vụ bản đồ không phản hồi nên MapMate chưa vẽ được bản đồ cho bạn.',
    tips: ['Kiểm tra lại mạng', 'Bấm "Thử lại" sau ít phút'],
  },
  [ERROR_KINDS.CRASH]: {
    emoji: '😵',
    title: 'Trang này vừa gặp lỗi',
    message: 'Đã có lỗi bất ngờ khi hiển thị trang. Dữ liệu của bạn vẫn an toàn.',
    tips: ['Bấm "Thử lại" để tải lại trang', 'Nếu lặp lại nhiều lần, hãy báo cho nhóm MapMate'],
  },
};

// Lời nhắn ngắn (thông báo tại chỗ) cho từng loại lỗi
const SHORT_MESSAGES = {
  [ERROR_KINDS.OFFLINE]: 'Không có kết nối mạng — kiểm tra Wi‑Fi / 4G rồi thử lại nhé.',
  [ERROR_KINDS.SERVER]: 'MapMate đang gặp trục trặc, bạn thử lại sau ít phút nhé.',
  [ERROR_KINDS.TIMEOUT]: 'Mạng hoặc máy chủ đang chậm, bạn thử lại nhé.',
  [ERROR_KINDS.RATE_LIMIT]: 'Bạn thao tác hơi nhanh, đợi khoảng 1 phút rồi thử lại nhé.',
  [ERROR_KINDS.NOT_FOUND]: 'Không tìm thấy nội dung này — có thể nó đã bị xoá.',
  [ERROR_KINDS.REQUEST]: 'Yêu cầu chưa hợp lệ, bạn kiểm tra lại thông tin nhé.',
};

const HTTP = { NOT_FOUND: 404, TOO_MANY: 429, SERVER_MIN: 500 };
// Lỗi làm cả trang không dùng được => sang trang lỗi
const PAGE_LEVEL_KINDS = [ERROR_KINDS.OFFLINE, ERROR_KINDS.SERVER, ERROR_KINDS.TIMEOUT];

// Phân loại lỗi axios (gọi backend MapMate hoặc Goong)
export const classifyHttpError = (error) => {
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return ERROR_KINDS.TIMEOUT;
  const status = error?.response?.status;
  if (!status) return typeof navigator !== 'undefined' && navigator.onLine === false ? ERROR_KINDS.OFFLINE : ERROR_KINDS.SERVER;
  if (status === HTTP.TOO_MANY) return ERROR_KINDS.RATE_LIMIT;
  if (status >= HTTP.SERVER_MIN) return ERROR_KINDS.SERVER;
  if (status === HTTP.NOT_FOUND) return ERROR_KINDS.NOT_FOUND;
  return ERROR_KINDS.REQUEST;
};

export const shortMessageFor = (kind) => SHORT_MESSAGES[kind] ?? SHORT_MESSAGES[ERROR_KINDS.SERVER];

export const isPageLevelError = (error) => PAGE_LEVEL_KINDS.includes(error?.kind);

// Lỗi từ dịch vụ ngoài (Goong chỉ đường / tìm địa chỉ) => Error mang lời nhắn dễ hiểu, giữ lỗi gốc trong `cause`
export const toFriendlyError = (error, actionText) => {
  const kind = classifyHttpError(error);
  const reason = {
    [ERROR_KINDS.OFFLINE]: 'thiết bị đang mất mạng',
    [ERROR_KINDS.TIMEOUT]: 'mạng đang chậm',
    [ERROR_KINDS.RATE_LIMIT]: 'dịch vụ bản đồ đang bận, đợi vài giây rồi thử lại',
  }[kind] ?? 'dịch vụ bản đồ tạm thời không phản hồi';
  return Object.assign(new Error(`${actionText} — ${reason}.`, { cause: error }), { kind });
};

// Nội dung hiển thị cho 1 lỗi bất kỳ (khung lỗi trong trang / tab / thẻ):
// lỗi mạng, máy chủ... => nội dung chuẩn; lỗi do yêu cầu (4xx) => lời nhắn backend đã viết sẵn cho người dùng
export const errorContent = (error, fallbackTitle = 'Chưa tải được nội dung') => {
  const page = ERROR_PAGES[error?.kind];
  if (page && error.kind !== ERROR_KINDS.NOT_FOUND) return { emoji: page.emoji, title: page.title, message: page.message };
  return { emoji: error?.kind === ERROR_KINDS.NOT_FOUND ? '🧭' : '😕', title: fallbackTitle, message: error?.message || shortMessageFor(ERROR_KINDS.SERVER) };
};
