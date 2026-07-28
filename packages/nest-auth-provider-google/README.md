# @wdev-studio/nest-auth-provider-google

Provider Google OAuth 2.1 + OpenID Connect para `@wdev-studio/nest-auth`.

## Funcionalidades

- Authorization URL com PKCE, State e Nonce
- Exchange de código de autorização
- Refresh Token
- Revogação de token
- UserInfo via OpenID Connect
- Suporte a `prompt`, `access_type`, `scopes` customizados

## Uso

```typescript
import { GoogleProvider } from '@wdev-studio/nest-auth-provider-google';

const provider = new GoogleProvider();
provider.initialize({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/auth/google/callback',
  scopes: ['openid', 'profile', 'email'],
});
```

## Registro no AuthModule

```typescript
AuthModule.forRoot({
  providers: [new GoogleProvider()],
  // ...
})
```

## Endpoints

- `GET /auth/google/url` — URL de autorização
- `GET /auth/google/callback` — Callback OAuth
