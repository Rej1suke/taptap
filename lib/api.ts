import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  const serialized = error instanceof Error ? `${error.message} ${'cause' in error ? String(error.cause) : ''}` : '';
  if (/23505|unique.constraint|duplicate key/i.test(serialized)) return NextResponse.json({ error: { code: 'CONFLICT', message: 'A record with this identity already exists.' } }, { status: 409 });
  if (/23503|foreign.key/i.test(serialized)) return NextResponse.json({ error: { code: 'REFERENCE_CONFLICT', message: 'A referenced record changed. Reload the menu and try again.' } }, { status: 409 });
  console.error('Request failed', error instanceof Error ? error.name : 'UnknownError');
  return NextResponse.json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'The service is temporarily unavailable. Please try again.' } }, { status: 503 });
}

export function requireSameOrigin(request: Request): void {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new ApiError(403, 'INVALID_ORIGIN', 'Use the same origin for this request.');
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ApiError(415, 'JSON_REQUIRED', 'Use application/json.');
  if (Number(request.headers.get('content-length') ?? 0) > 16384) throw new ApiError(413, 'BODY_TOO_LARGE', 'Request body is too large.');
  const text = await request.text();
  if (text.length > 16384) throw new ApiError(413, 'BODY_TOO_LARGE', 'Request body is too large.');
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new ApiError(400, 'INVALID_JSON', 'Provide valid JSON.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError(400, 'INVALID_BODY', 'Provide a JSON object.');
  return value as Record<string, unknown>;
}

export function allowedKeys(body: Record<string, unknown>, keys: readonly string[]): void {
  const unexpected = Object.keys(body).find((key) => !keys.includes(key));
  if (unexpected) throw new ApiError(400, 'INVALID_FIELD', `Unexpected field: ${unexpected}.`);
}

export function stringField(value: unknown, field: string, max = 200): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a nonempty string of at most ${max} characters.`);
  return value.trim();
}

export function passwordField(value: unknown): string {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) throw new ApiError(400, 'VALIDATION_ERROR', 'password must contain 8 to 128 characters.');
  return value;
}
