import assert from 'node:assert/strict';
for(const [path,method] of [['/api/acompanhamentos','GET'],['/api/acompanhamentos/demo-001/feedback','GET'],['/api/acompanhamentos/demo-001/feedback','POST']]){const r=await fetch('http://127.0.0.1:3101'+path,{method});assert.equal(r.status,401);}
const r=await fetch('http://127.0.0.1:3101/feedback');assert.equal(r.status,200);
console.log('PASS: build de produção responde e nega listagem, leitura e geração sem autorização integrada.');
