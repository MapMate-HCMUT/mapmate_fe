import { useCallback, useEffect, useRef, useState } from 'react';

export const CROPPER_MIN_ZOOM = 1;
export const CROPPER_MAX_ZOOM = 4;
const WHEEL_ZOOM_STEP = 0.0015;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Logic khung cắt ảnh vuông: kéo để dịch, thanh trượt / con lăn / chụm 2 ngón để zoom.
 * Ảnh luôn phủ kín khung (không lộ khoảng trống). `offset` = độ lệch tâm ảnh so với tâm khung (px màn hình).
 */
export const useImageCropper = (image, viewportSize) => {
  const [zoom, setZoomState] = useState(CROPPER_MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const viewportRef = useRef(null);
  const pointers = useRef(new Map());
  const pinchStart = useRef(null);
  const zoomRef = useRef(zoom);

  const naturalWidth = image?.naturalWidth ?? 1;
  const naturalHeight = image?.naturalHeight ?? 1;
  const baseScale = viewportSize / Math.min(naturalWidth, naturalHeight); // zoom 1 = vừa phủ kín khung
  const scale = baseScale * zoom;
  const displayWidth = naturalWidth * scale;
  const displayHeight = naturalHeight * scale;

  const clampOffset = useCallback(
    (next, nextZoom) => {
      const s = baseScale * nextZoom;
      const maxX = (naturalWidth * s - viewportSize) / 2;
      const maxY = (naturalHeight * s - viewportSize) / 2;
      return { x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
    },
    [baseScale, naturalWidth, naturalHeight, viewportSize],
  );

  const setZoom = useCallback(
    (value) => {
      const nextZoom = clamp(value, CROPPER_MIN_ZOOM, CROPPER_MAX_ZOOM);
      setZoomState(nextZoom);
      setOffset((prev) => clampOffset(prev, nextZoom));
    },
    [clampOffset],
  );

  const reset = useCallback(() => {
    setZoomState(CROPPER_MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Ảnh mới => về trạng thái ban đầu (điều chỉnh state ngay khi render, không cần effect)
  const [trackedImage, setTrackedImage] = useState(image);
  if (image !== trackedImage) {
    setTrackedImage(image);
    setZoomState(CROPPER_MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Con lăn chuột: phải gắn listener thường (passive: false) để chặn cuộn trang.
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;
    const onWheel = (event) => {
      event.preventDefault();
      setZoom(zoomRef.current * (1 - event.deltaY * WHEEL_ZOOM_STEP));
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [setZoom, image]);

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  };

  const onPointerMove = (event) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      setZoom((pinchStart.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinchStart.current.distance);
      return;
    }
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    setOffset((prev) => clampOffset({ x: prev.x + dx, y: prev.y + dy }, zoom));
  };

  const onPointerUp = (event) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };

  // Vùng đang nằm trong khung, quy về toạ độ pixel gốc của ảnh.
  const getCropArea = useCallback(() => {
    const size = viewportSize / scale;
    const x = clamp(naturalWidth / 2 - offset.x / scale - size / 2, 0, naturalWidth - size);
    const y = clamp(naturalHeight / 2 - offset.y / scale - size / 2, 0, naturalHeight - size);
    return { x, y, size };
  }, [viewportSize, scale, naturalWidth, naturalHeight, offset]);

  return {
    viewportRef,
    zoom,
    setZoom,
    reset,
    getCropArea,
    imageStyle: {
      width: displayWidth,
      height: displayHeight,
      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
    },
    pointerHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
};
