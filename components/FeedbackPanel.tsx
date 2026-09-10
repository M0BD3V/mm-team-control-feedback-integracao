'use client';
import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Link2, MessageSquare, RefreshCw } from 'lucide-react';
import { questions, type Feedback } from '../lib/feedback-contract';

// Renderizar este componente na aba Feedback do acompanhamento real.
export default function FeedbackPanel({ acompanhamentoId }: { acompanhamentoId: string }) {
 const [items, setItems] = useState<Feedback[]>([]);
 const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
 const [link, setLink] = useState(''); const [copied, setCopied] = useState(false); const [error, setError] = useState('');
 const refresh = useCallback(async () => {
  setLoading(true); setError('');
  try { const response = await fetch(`/api/acompanhamentos/${encodeURIComponent(acompanhamentoId)}/feedback`, { cache: 'no-store' }); const data = await response.json() as Feedback[] & { message?: string }; if (!response.ok) throw new Error(data.message); setItems(data); }
  catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível carregar.'); } finally { setLoading(false); }
 }, [acompanhamentoId]);
 useEffect(() => { void refresh(); const onFocus = () => { void refresh(); }; window.addEventListener('focus', onFocus); return () => window.removeEventListener('focus', onFocus); }, [refresh]);
 async function generate() {
  setBusy(true); setError(''); setCopied(false);
  try { const response = await fetch(`/api/acompanhamentos/${encodeURIComponent(acompanhamentoId)}/feedback`, { method: 'POST' }); const data = await response.json() as { url: string; message?: string }; if (!response.ok) throw new Error(data.message); setLink(data.url); }
  catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível gerar o link.'); } finally { setBusy(false); }
 }
 return <section className="feedback-panel"><div className="panel-heading"><div><h3>Feedback do cliente</h3><p>Envie o convite e acompanhe as respostas por aqui.</p></div><button className="primary" onClick={generate} disabled={busy}><Link2 size={17}/>{busy ? 'Gerando…' : 'Gerar link de feedback'}</button></div>
 {link && <div className="invite"><label htmlFor="feedback-link">Link personalizado · válido por 30 dias · uma resposta por link</label><div className="link-row"><input id="feedback-link" value={link} readOnly onFocus={e => e.target.select()}/><button onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setError('Selecione e copie o link no campo acima.'); } }}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copiado' : 'Copiar'}</button><a href={link} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Abrir página</a></div></div>}
 {error && <p role="alert" className="error">{error}</p>}
 <div className="response-heading"><span className={`pill ${items.length ? 'green' : ''}`}>{items.length ? `${items.length} feedback${items.length > 1 ? 's' : ''} recebido${items.length > 1 ? 's' : ''}` : 'Aguardando resposta'}</span><button onClick={() => void refresh()} disabled={loading}><RefreshCw size={15}/>{loading ? 'Atualizando…' : 'Atualizar'}</button></div>
 {!loading && !items.length && !error && <div className="empty-feedback"><MessageSquare size={30}/><h4>Nenhum feedback recebido</h4><p>Quando o cliente responder, o feedback aparecerá neste acompanhamento.</p></div>}
 {items.map(item => <article className="response-card" key={item.id}><header><div><h4>{item.name}</h4><span>{item.feedbackType === 'treinamento' ? 'Treinamento e implantação' : 'Produtos MM Softwares'}</span></div><time dateTime={new Date(item.createdAt).toISOString()}>{new Date(item.createdAt).toLocaleString('pt-BR')}</time></header><dl>{Object.entries(item.answers).filter(([,v]) => v).map(([key,value]) => <div key={key}><dt>{questions[key as keyof typeof questions] || key}</dt><dd>{key === 'rating' ? `${value} / 5` : value}</dd></div>)}</dl></article>)}
 </section>;
}
