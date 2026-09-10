import 'dotenv/config';
import { mkdir, readFile } from 'node:fs/promises';
import { createClient } from '@libsql/client';
await mkdir('data', { recursive: true });
const db = createClient({ url: process.env.MM_DATABASE_URL || 'file:data/mm-feedback.db' });
await db.executeMultiple(await readFile('migrations/001_feedback.sql', 'utf8'));
for (const row of [
 ['demo-001','Empresa Horizonte','Implantação do SIWEB','Gabriel','Em andamento'],
 ['demo-002','Logística Atlântico','Treinamento WMS','Mariana','Em andamento'],
 ['demo-003','Terminal Aurora','Acompanhamento pós-implantação','Rafael','Concluído'],
]) await db.execute({ sql: 'INSERT OR IGNORE INTO mm_acompanhamentos VALUES (?, ?, ?, ?, ?)', args: row });
db.close();
console.log('Banco inicializado com três acompanhamentos fictícios.');
