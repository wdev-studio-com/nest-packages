# @wdev-studio/nest-auth — Ecossistema de Autenticação para NestJS

Framework de autenticação modular, extensível e fortemente tipado para **NestJS**, com suporte a **OAuth 2.1**, **OpenID Connect**, **JWT**, **PKCE** e múltiplos providers sociais.

```mermaid
graph TD
    A[Frontend] -->|GET /auth/google/url| B[Auth Core]
    B --> C[Google Provider]
    C --> D[Google OAuth]
    D --> C
    C --> E[Prisma Adapter]
    E --> F[PostgreSQL]
    C --> G[JWT Service]
    G --> A
```

## Pacotes

| Pacote | Descrição |
|--------|-----------|
| `@wdev-studio/nest-auth` | Núcleo: AuthModule, guards, decorators, JWT, Session, OAuth Manager |
| `@wdev-studio/nest-auth-provider-google` | Provider Google OAuth 2.1 + OpenID Connect |
| `@wdev-studio/nest-auth-adapter-prisma` | Adapter de persistência para Prisma ORM |
| `@wdev-studio/nest-auth-types` | Contratos compartilhados (interfaces, DTOs, enums) |

## Arquitetura

```mermaid
graph LR
    subgraph "Camada de Apresentação"
        C[Controller]
        G[Guard]
        D[Decorators]
    end
    
    subgraph "Camada de Core"
        OM[OAuth Manager]
        JM[JWT Service]
        SM[Session Service]
        CM[Cookie Manager]
        EB[Event Bus]
        HE[Hooks Engine]
    end
    
    subgraph "Camada de Providers"
        GP[Google Provider]
        GH[GitHub Provider]
        AP[Apple Provider]
    end
    
    subgraph "Camada de Persistência"
        PA[Prisma Adapter]
        DB[(PostgreSQL)]
    end
    
    C --> OM
    G --> JM
    OM --> GP
    GP --> OM
    OM --> PA
    PA --> DB
```

## Instalação

```bash
bun add @wdev-studio/nest-auth @wdev-studio/nest-auth-provider-google @wdev-studio/nest-auth-adapter-prisma
```

## Uso mínimo

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '@wdev-studio/nest-auth';
import { GoogleProvider } from '@wdev-studio/nest-auth-provider-google';
import { PrismaAdapter } from '@wdev-studio/nest-auth-adapter-prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Module({
  imports: [
    AuthModule.forRoot({
      providers: [new GoogleProvider()],
      adapter: new PrismaAdapter(prisma),
      jwt: {
        secret: process.env.JWT_SECRET!,
        expiresIn: '15m',
        refreshExpiresIn: '7d',
      },
    }),
  ],
})
export class AppModule {}
```

## Fluxo de Login

```mermaid
sequenceDiagram
    Frontend->>Auth Core: GET /auth/google/url
    Auth Core->>Google Provider: getAuthorizationUrl()
    Google Provider-->>Frontend: URL com state, nonce, PKCE
    Frontend->>Google OAuth: Redirect
    Google OAuth-->>Frontend: Authorization Code
    Frontend->>Auth Core: GET /auth/google/callback?code=...
    Auth Core->>Google Provider: exchangeCode()
    Google Provider->>Google OAuth: POST /token
    Google OAuth-->>Google Provider: access_token + id_token
    Google Provider->>Google OAuth: GET /userinfo
    Google OAuth-->>Google Provider: User Info
    Google Provider-->>Auth Core: User + Tokens
    Auth Core->>Prisma Adapter: createUser / findUser
    Auth Core->>Prisma Adapter: createAccount
    Auth Core->>JWT Service: sign tokens
    Auth Core-->>Frontend: access_token + refresh_token
```

## Eventos

| Evento | Disparo |
|--------|---------|
| `beforeLogin` | Antes de iniciar o fluxo de login |
| `afterLogin` | Após login completo |
| `beforeUserCreate` | Antes de criar novo usuário |
| `afterUserCreate` | Após criar novo usuário |
| `beforeTokenIssued` | Antes de emitir tokens JWT |
| `afterTokenIssued` | Após emitir tokens JWT |
| `beforeLogout` | Antes do logout |
| `afterLogout` | Após o logout |

## Hooks

```typescript
AuthModule.forRoot({
  hooks: {
    onUserCreated: async (user) => { /* ... */ },
    onLogin: async (user, provider) => { /* ... */ },
    onLogout: async (user) => { /* ... */ },
    onRefresh: async (user, tokenId) => { /* ... */ },
  },
})
```

## Endpoints Automáticos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/auth/google/url` | URL de autorização Google |
| GET | `/auth/google/callback` | Callback OAuth |
| POST | `/auth/refresh` | Renovar tokens |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Dados do usuário logado |

## Criando um Provider

```typescript
import { OAuthProvider, OAuthProviderConfig, TokenPairDto, UserInfoDto } from '@wdev-studio/auth-types';

export class GitHubProvider implements OAuthProvider {
  readonly name = 'github';
  
  initialize(config: OAuthProviderConfig): void { /* ... */ }
  getAuthorizationUrl(params?: AuthorizationUrlParams): URL { /* ... */ }
  async exchangeCode(params: ExchangeCodeParams): Promise<TokenPairDto> { /* ... */ }
  async getUser(accessToken: string): Promise<UserInfoDto> { /* ... */ }
  // ... outros métodos
}
```

## Segurança

- OAuth 2.1 + OpenID Connect
- PKCE (Proof Key for Code Exchange)
- State + Nonce (antiforgery)
- Cookies HttpOnly, SameSite, Secure
- Refresh Token Rotation
- Token Revocation
- Rate Limit (customizável)

## Licença

MIT
