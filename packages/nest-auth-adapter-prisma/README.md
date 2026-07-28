# @wdev-studio/nest-auth-adapter-prisma

Adapter Prisma ORM para `@wdev-studio/nest-auth`.

## Modelos

O schema Prisma cria automaticamente:

- **User** — Usuários da aplicação
- **Account** — Contas vinculadas a providers OAuth
- **Session** — Sessões de usuário
- **RefreshToken** — Tokens de refresh com hash
- **OAuthState** — Estados PKCE
- **OAuthNonce** — Nonces OIDC
- **LoginHistory** — Histórico de logins

## Uso

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@wdev-studio/nest-auth-adapter-prisma';

const prisma = new PrismaClient();
const adapter = new PrismaAdapter(prisma);
```

## Registro no AuthModule

```typescript
AuthModule.forRoot({
  adapter: new PrismaAdapter(prisma),
  // ...
})
```

## Schema

```bash
bunx prisma generate
bunx prisma db push
```
