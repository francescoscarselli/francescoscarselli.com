export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function createQueue(tracks) {
  const list = Array.isArray(tracks) ? tracks : [];
  return { tracks: list, index: list.length ? 0 : -1 };
}

export function currentTrack(queue) {
  if (!queue || queue.index < 0) return null;
  return queue.tracks[queue.index] ?? null;
}

export function advance(queue, step) {
  const size = queue.tracks.length;
  if (!size) return queue;
  const next = (((queue.index + step) % size) + size) % size;
  return { tracks: queue.tracks, index: next };
}

export function selectTrack(queue, index) {
  if (index < 0 || index >= queue.tracks.length) return queue;
  return { tracks: queue.tracks, index };
}

export function progress(current, duration) {
  if (!Number.isFinite(current) || !Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(1, Math.max(0, current / duration));
}
