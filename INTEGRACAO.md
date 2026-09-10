# Guia para o responsável pelo MM Team Control

## Resultado esperado

Na tela de detalhe de um acompanhamento, junto das abas existentes, adicionar **Feedback**. A aba gera um convite associado ao ID do registro aberto. O cliente responde na página MM Softwares com a empresa no cabeçalho, título e campo Empresa. As respostas ficam disponíveis na mesma aba, com nome, data e perguntas/respostas, sem abrir um Forms externo.

## 1. Integrar o componente

```tsx
import FeedbackPanel from './components/FeedbackPanel';
// Dentro da aba Feedback. A key reinicia o estado ao mudar de acompanhamento.
<FeedbackPanel key={acompanhamento.id} acompanhamentoId={String(acompanhamento.id)} />
```

O componente utiliza React e lucide-react. Adapte as URLs se o backend tiver prefixo diferente. Reaproveite os estilos `.feedback-panel`, `.panel-heading`, `.invite`, `.link-row`, `.response-heading`, `.empty-feedback`, `.response-card`, `.pill` e `.error` de `app/team-control.css`, ou converta para o design system existente. O restante desse CSS e `app/page.tsx` são apenas o painel de demonstração.

## 2. Substituir o adaptador de autorização

Em `server/feedback.ts`, **substituir `requireStaff`** pela autenticação real e checagem de permissão por acompanhamento e organização/tenant. Não basta verificar se o usuário está logado. A listagem deve retornar apenas acompanhamentos autorizados. POST de geração e GET de respostas devem verificar o mesmo escopo. Configure `MM_DEMO_MODE=false` em produção. O fallback atual retorna 401 e não abre acesso.

O modo demo é uma conveniência local, não uma implementação de autenticação. Não publicar com esse modo ativo atrás de um proxy que reescreva o hostname como localhost. Integrar a proteção CSRF do sistema quando usar sessão por cookie. O exemplo também rejeita Origin diferente do da requisição.

## 3. Adaptar persistência

Mapear `mm_acompanhamentos` para a tabela e IDs existentes; não duplicar o cadastro real de empresas. A tabela do demo contém somente dados fictícios. Criar as tabelas de convites e respostas com a chave estrangeira para o acompanhamento real. Incluir o escopo de tenant quando necessário. A migration de referência é SQLite; adaptar tipos e sintaxe caso o sistema use PostgreSQL/MySQL.

Preservar `UNIQUE(token_hash)` e `UNIQUE(link_id)`. A restrição no banco impede duas respostas para o mesmo convite mesmo em envios simultâneos. Usar migrações controladas; `scripts/setup.mjs` é apenas inicializador do teste. Não executar o seed no banco real.

## 4. Contrato HTTP

| Método / rota | Acesso | Resultado |
|---|---|---|
| GET `/api/acompanhamentos` | Equipe autorizada | Lista usada somente pelo seletor de teste |
| POST `/api/acompanhamentos/:id/feedback` | Equipe autorizada | `{ url, expiresAt }` (datas em milissegundos Unix) |
| GET `/api/acompanhamentos/:id/feedback` | Equipe autorizada | Array de `{ id, name, feedbackType, createdAt, answers }` |
| GET `/api/convite?token=...` | Portador do convite | `{ company, title, answered }`; nunca inclui respostas |
| POST `/api/feedback` | Portador do convite | `{ ok: true }` |

Exemplo de envio:

```json
{
  "token": "TOKEN_RECEBIDO_NO_LINK",
  "name": "Nome do cliente",
  "feedbackType": "treinamento",
  "initialExperience": "Experiência inicial positiva",
  "trainingExpectations": "O treinamento está atendendo"
}
```

Opcionais de treinamento: `difficulties`, `improvements`, `experienceWord`, `teamMessage`. Para `feedbackType=produtos`, enviar `productExperience` e `rating` como string de `1` a `5`. Nome limitado a 200 caracteres; textos longos a 4.000; palavra de experiência a 200; corpo a 40.000 bytes. Empresa enviada pelo navegador é ignorada para o vínculo. Erros seguem `{ message }`, com 400, 401, 403, 404, 409, 410, 413, 415, 500 ou 503 conforme o caso.

## 5. Publicar a página e as rotas

Hospedar `/feedback` e os assets de `public/` com as APIs no mesmo domínio para reaproveitar o contrato de URLs relativas. Configurar `MM_PUBLIC_ORIGIN=https://DOMINIO-DO-MODULO` no servidor; não montar o endereço usando Host fornecido pelo cliente. Se separar o domínio do formulário, adaptar o cliente HTTP e definir CORS por allowlist, com as rotas internas sempre protegidas.

Configurar HTTPS e armazenamento persistente/backup do banco. Não colocar tokens em analytics ou logs de query strings; a página usa `Referrer-Policy: no-referrer`. Os links são credenciais de envio e qualquer portador pode responder uma vez. Antes de exposição pública, aplicar os limites de requisição da infraestrutura nas rotas de convite/envio e definir a política de retenção do sistema. O demo não fornece rate limiter distribuído nem fluxo de revogação.

## 6. Critérios de aceite da integração real

1. Selecionar dois acompanhamentos da mesma empresa e confirmar que as respostas ficam separadas por ID.
2. Gerar convite, verificar nome da empresa, preencher e confirmar a resposta na aba correta.
3. Confirmar que usuário sem permissão (inclusive outro tenant) não consegue gerar link nem ler respostas.
4. Confirmar que link inválido, expirado e já respondido tem tratamento apropriado.
5. Confirmar que dois envios simultâneos persistem apenas uma resposta.
6. Reiniciar o serviço e confirmar que o histórico permanece.

O teste entregue cobre o serviço de referência. A autorização do sistema real e o deploy final precisam ser validados pelo responsável após a adaptação.
