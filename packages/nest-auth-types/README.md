# @wdev-studio/nest-auth-types

Contratos compartilhados do ecossistema `@wdev-studio/nest-auth`.

## Interfaces

- `OAuthProvider` — Contrato para providers OAuth
- `DatabaseAdapter` — Contrato para adapters de banco
- `EventBus` — Sistema de eventos
- `Hooks` — Lifecycle hooks
- `Logger` — Interface de log

## Enums

- `AuthEvent` — Eventos do ciclo de autenticação
- `TokenType` — Tipos de token (access, refresh, id)

## DTOs

- `TokenPairDto` — Par access/refresh token
- `UserInfoDto` — Dados do usuário OAuth
- `LoginDto` — Payload de login
- `LogoutDto` — Payload de logout

## Models

- `UserModel`, `AccountModel`, `SessionModel`
- `RefreshTokenModel`, `OAuthStateModel`
- `OAuthNonceModel`, `LoginHistoryModel`
