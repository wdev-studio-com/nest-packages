# @wdev-studio/nest-auth

Núcleo do ecossistema de autenticação para NestJS.

## Componentes

### AuthModule

```typescript
AuthModule.forRoot({
  providers: [...],
  adapter: ...,
  jwt: { secret: '...', expiresIn: '15m' },
})
```

### Serviços

- **OAuthManager** — Orquestra o fluxo OAuth com providers registrados
- **JwtService** — Assinatura, verificação e revogação de JWT
- **SessionService** — Gerenciamento de sessões de usuário
- **CookieManager** — Serialização segura de cookies
- **EventBus** — Sistema pub/sub para eventos de autenticação
- **HooksEngine** — Lifecycle hooks (onUserCreated, onLogin, etc)
- **ProviderRegistry** — Registro e descoberta de providers OAuth
- **AdapterRegistry** — Registro do adapter de banco de dados

### Guards e Decorators

- `AuthGuard` — Protege rotas validando JWT Bearer token
- `@Public()` — Marca rota como pública (ignora guard)
- `@Auth()` — Atalho para `UseGuards(AuthGuard)`
- `@CurrentUser()` — Extrai usuário do request

### Segurança

- JWT com suporte a HS256/RS256/ES256
- Refresh Token Rotation
- Blacklist de tokens revogados
- Cookies HttpOnly, SameSite, Secure
- PKCE + State + Nonce
