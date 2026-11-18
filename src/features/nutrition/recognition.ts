import type { Box, FoodRow } from './nutrition';

export type Detection = { label: string; score: number; box: Box };
export type RecognitionResult = { apiVersion: 2; imageWidth: number; imageHeight: number; detections: Detection[] };
export function validResult(value: unknown): value is RecognitionResult {
  if (!value || typeof value !== 'object') return false;
  const r = value as RecognitionResult;
  return r.apiVersion === 2 && Number.isFinite(r.imageWidth) && r.imageWidth > 0 &&
    Number.isFinite(r.imageHeight) && r.imageHeight > 0 && Array.isArray(r.detections) &&
    r.detections.length <= 20 && r.detections.every(d => d && typeof d.label === 'string' &&
      d.label.trim().length > 0 && Number.isFinite(d.score) && d.score >= 0 && d.score <= 1 &&
      Array.isArray(d.box) && d.box.length === 4 && d.box.every(n => Number.isFinite(n) && n >= 0 && n <= 1) &&
      d.box[2] > d.box[0] && d.box[3] > d.box[1]);
}
export function groupDetections(detections: Detection[]): FoodRow[] {
  const groups = new Map<string, FoodRow>();
  for (const detection of detections) {
    let row = groups.get(detection.label);
    if (!row) {
      row = { id: `detected-${groups.size}`, name: detection.label, score: detection.score,
        boxes: [], grams: '', source: 'detector', confirmed: false };
      groups.set(detection.label, row);
    }
    row.boxes.push(detection.box);
    row.score = Math.max(row.score ?? 0, detection.score);
  }
  return [...groups.values()];
}
export function localEndpoint(value: string): string | null {
  const endpoint = value.trim().replace(/\/$/, '');
  const match = endpoint.match(/^http:\/\/(\d{1,3}(?:\.\d{1,3}){3}):8765$/);
  if (!match) return null;
  const ip = match[1].split('.').map(Number);
  if (ip.some(n => n > 255)) return null;
  return (ip[0] === 10 || (ip[0] === 192 && ip[1] === 168) ||
    (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31)) ? endpoint : null;
}
export async function recognizeFood(endpoint: string, token: string, image: string, signal: AbortSignal) {
  const response = await fetch(`${endpoint}/recognize`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Muvlet-Token': token },
    body: JSON.stringify({ image }),
  });
  if (response.status === 401) throw new Error('Incorrect pairing code. Check the server window.');
  if (response.status === 413) throw new Error('Photo too large. Try a smaller image.');
  if (!response.ok) throw new Error('The server could not analyze this photo. Try again or add foods manually.');
  const result: unknown = await response.json();
  if (!validResult(result)) throw new Error('Invalid server response. Start the meal-recognition server included with this branch.');
  return result;
}
