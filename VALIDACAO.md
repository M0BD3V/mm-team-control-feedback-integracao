# Verificação do pacote

Verificado em 09/09/2026, Windows, Node.js 24.19.0.

| Verificação | Resultado |
|---|---|
| Compilação de produção (`npm run build`) | Passou |
| TypeScript (`npm run typecheck`) | Passou |
| Rotas da aplicação respondem em desenvolvimento | Passou |
| Build de produção inicia e serve formulário | Passou |
| Geração e resolução de convite com nome da empresa | Passou |
| Gravação e leitura de treinamento e produtos | Passou |
| Dois envios simultâneos: uma gravação e um erro 409 | Passou |
| Separação entre empresas e entre acompanhamentos da mesma empresa | Passou |
| Token inválido e token expirado | Passou |
| Campos obrigatórios, nota e limite de corpo | Passou |
| Requisição com Origin externo rejeitada | Passou |
| Modo demo desligado: listagem, leitura e geração retornam 401 | Passou |

Os testes HTTP foram executados contra a aplicação, com SQLite local e dados fictícios. A verificação de autorização utilizou o build de produção em processo separado com `MM_DEMO_MODE=false`. A consulta das respostas verificou dados persistidos no servidor, sem armazenamento no navegador.

Não foi feita automação visual no navegador. A prévia local foi aberta no Codex. Não foram testados o banco, a autenticação, permissões por tenant ou deploy do MM Team Control original, cujo código não foi fornecido. O pacote não foi publicado na internet.

Para repetir: `npm run test:integration` e `node scripts/test-boundaries.mjs` com o servidor na porta 3100. O teste `scripts/test-auth.mjs` espera o build iniciado na porta 3101 com `MM_DEMO_MODE=false`. Os scripts adicionam dados fictícios ao banco de teste; não executar contra produção.
