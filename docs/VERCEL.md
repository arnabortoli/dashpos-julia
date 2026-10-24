# Publicação da demonstração na Vercel

Destino autorizado: reutilizar o projeto existente **radar-loumar**, substituindo a demonstração anterior por este repositório. Não criar um projeto novo chamado radar-atendimento-loumar e não alterar o projeto Igufoz.

## Configuração

- Repositório: `arnabortoli/dashpos-julia`, branch `main`.
- Framework: Next.js.
- Diretório raiz: raiz do repositório.
- Node.js: 24.x, versão principal validada neste ambiente.
- Instalação: `npm ci`.
- Build: `npm run build`.
- Diretório de saída: padrão do framework Next.js; não definir `out` ou outro diretório manualmente.
- Variáveis da aplicação: nenhuma. Dados e análises são inteiramente simulados.
- O token da Vercel é uma credencial de publicação, não uma variável da aplicação. Nunca colocá-lo no código, no `vercel.json`, em arquivos versionados ou no chat.

`vercel.json` registra o framework e os comandos já verificados. `.vercelignore` exclui caches e artefatos locais. O vínculo local em `.vercel/` não deve ser versionado.

## Conexão e seleção do projeto

1. Autenticar na conta Vercel que tem acesso a `radar-loumar`, usando o fluxo oficial de login ou uma credencial inserida nas configurações seguras do ambiente.
2. Consultar os espaços e projetos acessíveis e identificar a conta/time exata do projeto existente. Não presumir essa identidade com base no nome do GitHub.
3. Confirmar o nome e o ID de `radar-loumar` antes de vincular o checkout ou publicar. Se houver mais de um projeto com esse nome, solicitar a escolha do usuário.
4. Vincular explicitamente o checkout ao projeto existente. A CLI validada nesta preparação é Vercel 65.2.0; `vercel link --help` confirma a forma `vercel link --yes --team <team-id> --project <project-name-or-id>`.
5. Verificar o vínculo Git atual do projeto. Substituir a conexão anterior pelo repositório autorizado quando necessário, mantendo o nome do projeto. Não imprimir valores de variáveis ou credenciais existentes.
6. Publicar a demonstração nesse projeto e conferir a conclusão da build na Vercel. Não alterar domínios ou projetos de outros produtos.
7. Registrar o endereço efetivamente retornado pela Vercel, sem presumir que um domínio específico esteja disponível.

## Verificação depois da publicação

- Abrir o endereço retornado, confirmar a sinalização de dados simulados e a visão geral da Júlia.
- Navegar pelos cinco perfis e abrir ao menos uma conversa completa em Exemplos.
- Mudar uma semana e conferir CSAT e evolução.
- Verificar o perfil de atendente e a ausência do comparativo gerencial na interface individual.
- Se a Vercel aplicar proteção ao deployment, usar o acesso autorizado para validar; não remover a proteção automaticamente.

Os 22 testes da aplicação e a build local já foram verificados, conforme `docs/VALIDATION.md`. A configuração preparada não comprova criação, vínculo ou publicação na conta Vercel: essas etapas dependem da autenticação e de respostas reais da plataforma.
