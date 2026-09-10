# MM Team Control — integração de feedback

Pacote de referência funcional para o responsável pelo MM Team Control integrar a aba **Feedback** à tela de Acompanhamentos. Inclui um painel de teste com dados fictícios e a página de feedback fornecida, adaptada para personalização por empresa. Não contém código-fonte do sistema de produção, credenciais ou dados reais.

## Executar o teste

Requisitos: Node.js 22.13 ou superior e pnpm. Abra o terminal nesta pasta:

```sh
pnpm install --frozen-lockfile
```

Copie `.env.example` para `.env` (PowerShell: `Copy-Item .env.example .env`). Depois:

```sh
npm run db:setup
npm run dev
```

Abra http://127.0.0.1:3100/acompanhamentos. Selecione empresa/acompanhamento, abra **Feedback**, gere o link e clique em **Abrir página**. Responda e envie. Ao retornar ao painel, as respostas são consultadas novamente; também há o botão **Atualizar**.

O endereço local serve para testar neste computador. Para clientes externos, o responsável precisa hospedar o módulo, integrar a autenticação e definir `MM_PUBLIC_ORIGIN` com o domínio HTTPS final.

## Conteúdo

| Arquivo | Finalidade |
|---|---|
| `components/FeedbackPanel.tsx` | Aba reutilizável: gerar/copiar convite e ler respostas |
| `app/feedback/page.tsx` | Página original personalizada; resolve empresa usando o token |
| `server/feedback.ts` | Serviço de links, validação, leitura, gravação e ponto de autorização |
| `app/api/acompanhamentos/**` | Rotas internas da demonstração |
| `app/api/convite/route.ts` | Resolve os dados públicos do convite |
| `app/api/feedback/route.ts` | Recebe respostas do cliente |
| `migrations/001_feedback.sql` | Esquema SQLite de referência |
| `lib/feedback-contract.ts` | Tipos e rótulos das respostas |
| `app/team-control.css` | Estilo do painel de teste e da aba |
| `INTEGRACAO.md` | Adaptações necessárias no sistema existente |

## Regras implementadas

- Um token aleatório de 256 bits por convite; só o hash SHA-256 é armazenado.
- Empresa e acompanhamento são resolvidos no servidor. Alterar o nome da empresa no envio não muda o vínculo.
- Validade de 30 dias e uma resposta por convite. Uma nova solicitação gera outro link, preservando as respostas anteriores.
- O link é exibido na geração. Depois de sair da tela, gere outro se não tiver copiado; o token original não é recuperável do banco.
- Treinamento e produtos mantêm os campos da página original. O cliente escolhe o tipo e envia uma resposta por convite.
- Respostas são armazenadas no SQLite, e persistem entre reinicializações. O banco de demonstração fica em `data/` e não acompanha o ZIP.
- O cliente vê a confirmação, sem acesso às respostas anteriores. O painel lista o histórico pelo acompanhamento.
- Não há envio automático de WhatsApp ou e-mail. O botão Copiar permite compartilhar manualmente.

## Verificação

Com o servidor de teste em execução:

```sh
npm run test:integration
npm run typecheck
npm run build
```

Os testes de integração gravam respostas fictícias. Execute somente contra o ambiente de teste. Veja `VALIDACAO.md` para o resultado da verificação entregue.

## Limite de integração

Esta implementação usa React/Vinext e SQLite via libSQL em Node. A estrutura real do backend, banco e autenticação do MM Team Control não foi fornecida. O responsável deve adaptar o serviço e as rotas ao stack existente; o pacote não é um patch que possa ser aplicado automaticamente à produção. O modo demo funciona apenas com configuração explícita e acesso local. Fora dele, as rotas internas negam acesso até a integração da autorização.
