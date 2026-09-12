import { Debate, JudgeScorecard, StreamEvent } from './types';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000';

export async function fetchDebates(): Promise<Debate[]> {
  const res = await fetch(`${API_BASE}/debates`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch debates');
  return res.json();
}

export async function fetchDebate(id: string): Promise<Debate> {
  const res = await fetch(`${API_BASE}/debates/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch debate ${id}`);
  return res.json();
}

export async function createDebate(data: {
  topic: string;
  rounds?: number;
  style?: string;
  difficulty?: string;
  language?: string;
  agentAContext?: string;
  agentBContext?: string;
}): Promise<Debate> {
  const res = await fetch(`${API_BASE}/debates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || 'Failed to create debate');
  }
  return res.json();
}

export async function startDebate(id: string): Promise<{ message: string; debateId: string }> {
  const res = await fetch(`${API_BASE}/debates/${id}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || 'Failed to start debate');
  }
  return res.json();
}

export async function fetchJudgeResult(id: string): Promise<JudgeScorecard> {
  const res = await fetch(`${API_BASE}/debates/${id}/result`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch judge result for debate ${id}`);
  return res.json();
}

export async function deleteDebate(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/debates/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete debate');
}

export function subscribeToDebateStream(
  debateId: string,
  onEvent: (event: StreamEvent) => void,
  onError?: (err: any) => void,
): () => void {
  const eventSource = new EventSource(`${API_BASE}/debates/${debateId}/stream`);

  eventSource.onmessage = (e) => {
    try {
      const parsed: StreamEvent = JSON.parse(e.data);
      onEvent(parsed);
    } catch (err) {
      console.error('Error parsing SSE event:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('SSE stream notice/error:', err);
    if (onError) onError(err);
  };

  return () => {
    eventSource.close();
  };
}

export async function fetchTtsStatus(apiKey?: string): Promise<{
  available: boolean;
  engine: string;
  voices: { DEBATER_A: string; DEBATER_B: string; JUDGE: string };
}> {
  const url = apiKey ? `${API_BASE}/tts/status?key=${encodeURIComponent(apiKey)}` : `${API_BASE}/tts/status`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch TTS status');
  return res.json();
}

export async function synthesizeElevenLabsSpeech(data: {
  text: string;
  role?: string;
  language?: string;
  apiKey?: string;
}): Promise<Blob> {
  const res = await fetch(`${API_BASE}/tts/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'ElevenLabs synthesis request failed');
  }
  return res.blob();
}
