import { groupDetections, localEndpoint, recognizeFood, validResult, type RecognitionResult } from './recognition';

const result: RecognitionResult = { apiVersion: 2, imageWidth: 100, imageHeight: 100,
  detections: [{ label: 'rice', score: 0.8, box: [0, 0, 0.4, 1] }, { label: 'rice', score: 0.7, box: [0.5, 0, 1, 1] }] };
test('groups repeated food regions without treating region count as quantity', () => {
  const rows = groupDetections(result.detections);
  expect(rows).toHaveLength(1);
  expect(rows[0].boxes).toHaveLength(2);
  expect(rows[0].grams).toBe('');
  expect(rows[0].confirmed).toBe(false);
});
test('rejects malformed server data and old protocols', () => {
  expect(validResult(result)).toBe(true);
  expect(validResult({ ...result, apiVersion: 1 })).toBe(false);
  expect(validResult({ ...result, detections: [null] })).toBe(false);
  expect(validResult({ ...result, detections: [{ ...result.detections[0], box: [1, 0, 0, 1] }] })).toBe(false);
});
test.each(['http://192.168.1.4:8765', 'http://10.0.0.4:8765', 'http://172.20.10.2:8765'])('accepts local server %s', address => {
  expect(localEndpoint(address)).toBe(address);
});
test.each(['http://8.8.8.8:8765', 'http://192.168.999.1:8765', 'http://127.0.0.1:8765', 'http://192.168.1.1:80', 'http://172.32.0.1:8765'])('rejects unsupported address %s', address => {
  expect(localEndpoint(address)).toBeNull();
});
test('sends the pairing code and photo and handles auth errors', async () => {
  const original = globalThis.fetch;
  const mock = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => result });
  globalThis.fetch = mock;
  try {
    const signal = new AbortController().signal;
    await expect(recognizeFood('http://192.168.1.4:8765', 'code', 'photo', signal)).resolves.toEqual(result);
    expect(mock).toHaveBeenCalledWith('http://192.168.1.4:8765/recognize', expect.objectContaining({ signal, body: JSON.stringify({ image: 'photo' }), headers: expect.objectContaining({ 'X-Muvlet-Token': 'code' }) }));
    mock.mockResolvedValue({ ok: false, status: 401 });
    await expect(recognizeFood('http://192.168.1.4:8765', 'bad', 'photo', signal)).rejects.toThrow('pairing code');
  } finally { globalThis.fetch = original; }
});
