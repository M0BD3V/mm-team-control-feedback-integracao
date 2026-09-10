import 'dotenv/config';
import { createClient } from '@libsql/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { questions } from '../lib/feedback-contract';

const db = createClient({ url: process.env.MM_DATABASE_URL || 'file:data/mm-feedback.db' });
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function endpoint(action: () => Promise<unknown>) {
 try { return Response.json(await action(), { headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } }); }
 catch (error) { if (error instanceof ApiError) return Response.json({ message: error.message }, { status: error.status }); console.error('Falha na operação de feedback'); return Response.json({ message: 'Não foi possível concluir. Tente novamente.' }, { status: 500 }); }
}

// PONTO DE INTEGRAÇÃO OBRIGATÓRIO: substituir pela sessão real + permissão
// sobre acompanhamentoId (e tenant). O padrão fora do demo é NEGAR acesso.
export function requireStaff(request: Request, _acompanhamentoId?: string) {
 const host = new URL(request.url).hostname;
 if (process.env.MM_DEMO_MODE === 'true' && ['localhost','127.0.0.1','[::1]'].includes(host)) return;
 throw new ApiError(401, 'Integre a autenticação e as permissões do MM Team Control.');
}
export function checkOrigin(request: Request) {
 const origin = request.headers.get('origin');
 if (origin && origin !== new URL(request.url).origin) throw new ApiError(403, 'Origem não permitida.');
}
export async function jsonBody(request: Request) {
 if (!request.headers.get('content-type')?.includes('application/json')) throw new ApiError(415, 'Envie JSON.');
 const reader = request.body?.getReader();
 if (!reader) throw new ApiError(400, 'Dados inválidos.');
 let length = 0; const chunks: Uint8Array[] = [];
 while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > 40000) { await reader.cancel(); throw new ApiError(413, 'Resposta muito longa.'); } chunks.push(value); }
 try { const body = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); return body as Record<string, unknown>; } catch { throw new ApiError(400, 'Dados inválidos.'); }
}
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function listFollowups() {
 const result = await db.execute(`SELECT a.*, (SELECT COUNT(*) FROM mm_feedback_respostas r JOIN mm_feedback_links l ON l.id=r.link_id WHERE l.acompanhamento_id=a.id) AS responses FROM mm_acompanhamentos a ORDER BY a.company`);
 return result.rows;
}
export async function issueLink(id: string) {
 const origin = process.env.MM_PUBLIC_ORIGIN;
 if (!origin || !/^https?:\/\//.test(origin)) throw new ApiError(503, 'Configure MM_PUBLIC_ORIGIN.');
 const found = await db.execute({ sql: 'SELECT id FROM mm_acompanhamentos WHERE id=?', args: [id] });
 if (!found.rows.length) throw new ApiError(404, 'Acompanhamento não encontrado.');
 const token = randomBytes(32).toString('base64url'); const now = Date.now(); const expiresAt = now + 30 * 86400000;
 await db.execute({ sql: 'INSERT INTO mm_feedback_links VALUES (?,?,?,?,?)', args: [randomUUID(), id, hash(token), now, expiresAt] });
 const url = new URL('/feedback', origin); url.searchParams.set('token', token);
 return { url: url.toString(), expiresAt };
}
async function lookup(token: unknown) {
 if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new ApiError(404, 'Link inválido.');
 const result = await db.execute({ sql: `SELECT l.id, l.expires_at, a.company, a.title, r.id AS response_id FROM mm_feedback_links l JOIN mm_acompanhamentos a ON a.id=l.acompanhamento_id LEFT JOIN mm_feedback_respostas r ON r.link_id=l.id WHERE l.token_hash=?`, args: [hash(token)] });
 const row = result.rows[0];
 if (!row) throw new ApiError(404, 'Link inválido.');
 if (Number(row.expires_at) < Date.now()) throw new ApiError(410, 'Este link expirou. Solicite um novo à equipe.');
 return row;
}
export async function invitation(token: unknown) { const row = await lookup(token); return { company: row.company, title: row.title, answered: !!row.response_id }; }
function text(value: unknown, required: boolean, max = 4000) {
 if (value == null && !required) return '';
 if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new ApiError(400, 'Revise os campos obrigatórios e o tamanho das respostas.');
 return value.trim();
}
export async function submitFeedback(body: Record<string, unknown>) {
 const row = await lookup(body.token);
 if (row.response_id) throw new ApiError(409, 'Este link já recebeu um feedback. Obrigado!');
 const name = text(body.name, true, 200); const kind = body.feedbackType;
 if (kind !== 'treinamento' && kind !== 'produtos') throw new ApiError(400, 'Tipo de feedback inválido.');
 const answers: Record<string, string> = {};
 const keys = kind === 'treinamento' ? Object.keys(questions).filter(k => !['productExperience','rating'].includes(k)) : ['productExperience'];
 for (const key of keys) answers[key] = text(body[key], ['initialExperience','trainingExpectations','productExperience'].includes(key), key === 'experienceWord' ? 200 : 4000);
 if (kind === 'produtos') { if (typeof body.rating !== 'string' || !/^[1-5]$/.test(body.rating)) throw new ApiError(400, 'Selecione uma nota de 1 a 5.'); answers.rating = body.rating; }
 const result = await db.execute({ sql: 'INSERT INTO mm_feedback_respostas (id,link_id,name,feedback_type,answers_json,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(link_id) DO NOTHING', args: [randomUUID(), row.id, name, kind, JSON.stringify(answers), Date.now()] });
 if (!result.rowsAffected) throw new ApiError(409, 'Este link já recebeu um feedback. Obrigado!');
 return { ok: true };
}
export async function getFeedback(id: string) {
 const found = await db.execute({ sql: 'SELECT id FROM mm_acompanhamentos WHERE id=?', args: [id] });
 if (!found.rows.length) throw new ApiError(404, 'Acompanhamento não encontrado.');
 const rows = await db.execute({ sql: `SELECT r.* FROM mm_feedback_respostas r JOIN mm_feedback_links l ON l.id=r.link_id WHERE l.acompanhamento_id=? ORDER BY r.created_at DESC`, args: [id] });
 return rows.rows.map(r => ({ id: r.id, name: r.name, feedbackType: r.feedback_type, createdAt: Number(r.created_at), answers: JSON.parse(String(r.answers_json)) }));
}
