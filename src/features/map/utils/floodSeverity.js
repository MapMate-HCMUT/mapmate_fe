// Màu theo mức độ ngập (frontend/AGENT.md — mục 3.2: danger = ngập nặng, warning = ngập vừa).
export const FLOOD_SEVERITY = {
  high: { label: 'Ngập nặng', dot: 'bg-danger-500', halo: 'bg-danger-500/40', banner: 'bg-danger-500' },
  medium: { label: 'Ngập vừa', dot: 'bg-warning-500', halo: 'bg-warning-500/40', banner: 'bg-warning-500' },
};

const SEVERITY_RANK = { high: 2, medium: 1 };

export const getSeverity = (key) => FLOOD_SEVERITY[key] ?? FLOOD_SEVERITY.medium;

export const pickMostSevere = (alerts) =>
  [...alerts].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.depth_cm - a.depth_cm)[0] ?? null;
