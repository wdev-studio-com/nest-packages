export enum AuthEvent {
  BeforeLogin = 'beforeLogin',
  AfterLogin = 'afterLogin',
  BeforeUserCreate = 'beforeUserCreate',
  AfterUserCreate = 'afterUserCreate',
  BeforeTokenIssued = 'beforeTokenIssued',
  AfterTokenIssued = 'afterTokenIssued',
  BeforeLogout = 'beforeLogout',
  AfterLogout = 'afterLogout',
  Error = 'error',
}
