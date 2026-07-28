# @wdev-studio/nest-auth-provider-github

GitHub OAuth 2.0 provider para `@wdev-studio/nest-auth`.

## Instalação

```bash
bun add @wdev-studio/nest-auth-provider-github
```

## Uso

```typescript
import { GitHubProvider } from '@wdev-studio/nest-auth-provider-github';

AuthModule.forRoot({
  providers: [
    new GitHubProvider(),
  ],
  // ...
})
```

## Endpoints

- `GET /auth/github/url` — URL de autorização
- `GET /auth/github/callback` — Callback OAuth

## Notas

- GitHub não emite `refresh_token` no fluxo OAuth padrão
- GitHub não usa `nonce` (não é OIDC)
- O email é buscado via `/user/emails` se não vier no `/user`
