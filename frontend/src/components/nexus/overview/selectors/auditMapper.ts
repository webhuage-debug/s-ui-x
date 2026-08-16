import { isSelectorRecord, nonNegativeNumber, plainText } from './selectorUtils'

export const auditDisplayIcons = [
  'mdi-shield-outline',
  'mdi-shield-alert-outline',
  'mdi-login',
  'mdi-account-alert-outline',
  'mdi-account-lock-outline',
  'mdi-logout',
  'mdi-logout-variant',
  'mdi-account-plus-outline',
  'mdi-account-remove-outline',
  'mdi-account-key-outline',
  'mdi-key-plus',
  'mdi-key-minus',
  'mdi-key',
  'mdi-database-import-outline',
  'mdi-database-export-outline',
  'mdi-lock-reset',
] as const

export type AuditDisplayIcon = typeof auditDisplayIcons[number]
export type AuditDisplayTone = 'info' | 'success' | 'warning' | 'error'

export interface AuditDisplayDetail {
  actor?: string
  resource?: string
  event?: string
}

export interface AuditDisplayItem {
  id: number
  timestamp: number
  icon: AuditDisplayIcon
  tone: AuditDisplayTone
  textKey: string
  detail?: AuditDisplayDetail
}

type AuditPresentation = {
  icon: AuditDisplayIcon
  tone: AuditDisplayTone
  textKey: string
}

const knownAuditEvents = {
  login_success: {
    icon: 'mdi-login',
    tone: 'success',
    textKey: 'nexus.overview.events.items.loginSuccess',
  },
  login_failed: {
    icon: 'mdi-account-alert-outline',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.loginFailed',
  },
  login_blocked: {
    icon: 'mdi-account-lock-outline',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.loginBlocked',
  },
  logout: {
    icon: 'mdi-logout',
    tone: 'info',
    textKey: 'nexus.overview.events.items.logout',
  },
  logout_all_admins: {
    icon: 'mdi-logout-variant',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.logoutAllAdmins',
  },
  admin_credentials_changed: {
    icon: 'mdi-account-key-outline',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.adminCredentialsChanged',
  },
  admin_created: {
    icon: 'mdi-account-plus-outline',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.adminCreated',
  },
  admin_deleted: {
    icon: 'mdi-account-remove-outline',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.adminDeleted',
  },
  api_token_created: {
    icon: 'mdi-key-plus',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.apiTokenCreated',
  },
  api_token_deleted: {
    icon: 'mdi-key-minus',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.apiTokenDeleted',
  },
  api_token_enabled_changed: {
    icon: 'mdi-key',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.apiTokenEnabledChanged',
  },
  db_imported: {
    icon: 'mdi-database-import-outline',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.dbImported',
  },
  db_exported: {
    icon: 'mdi-database-export-outline',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.dbExported',
  },
  sub_secret_rotated: {
    icon: 'mdi-lock-reset',
    tone: 'warning',
    textKey: 'nexus.overview.events.items.subSecretRotated',
  },
  xui_import: {
    icon: 'mdi-database-import-outline',
    tone: 'success',
    textKey: 'nexus.overview.events.items.xuiImport',
  },
} satisfies Record<string, AuditPresentation>

type KnownAuditEvent = keyof typeof knownAuditEvents

const unknownPresentation: AuditPresentation = {
  icon: 'mdi-shield-alert-outline',
  tone: 'info',
  textKey: 'nexus.overview.events.items.unknown',
}

const isKnownAuditEvent = (event: string): event is KnownAuditEvent => {
  return Object.hasOwn(knownAuditEvents, event)
}

const presentationForUnknownEvent = (severity?: string): AuditPresentation => {
  if (severity === 'error') return { ...unknownPresentation, tone: 'error' }
  if (severity === 'warn' || severity === 'warning') {
    return { ...unknownPresentation, tone: 'warning' }
  }
  return unknownPresentation
}

const wholeNumber = (value: unknown): number => {
  const number = nonNegativeNumber(value)
  return number === undefined ? 0 : Math.floor(number)
}

const displayDetail = (
  actor: string | undefined,
  resource: string | undefined,
  unknownEvent: string | undefined,
): AuditDisplayDetail | undefined => {
  const detail: AuditDisplayDetail = {}
  if (actor) detail.actor = actor
  if (resource) detail.resource = resource
  if (unknownEvent) detail.event = unknownEvent
  return Object.keys(detail).length > 0 ? detail : undefined
}

export const mapAuditDisplayItem = (payload?: unknown): AuditDisplayItem => {
  const event = isSelectorRecord(payload) ? payload : {}
  const eventName = plainText(event.event)
  const severity = plainText(event.severity)
  const knownEventName = eventName && isKnownAuditEvent(eventName) ? eventName : undefined
  const presentation = knownEventName
    ? knownAuditEvents[knownEventName]
    : presentationForUnknownEvent(severity)
  const detail = displayDetail(
    plainText(event.actor),
    plainText(event.resource),
    knownEventName ? undefined : eventName,
  )

  const item: AuditDisplayItem = {
    id: wholeNumber(event.id),
    timestamp: wholeNumber(event.dateTime ?? event.timestamp),
    icon: presentation.icon,
    tone: presentation.tone,
    textKey: presentation.textKey,
  }

  if (detail) item.detail = detail
  return item
}

export const mapAuditDisplayItems = (payloads?: readonly unknown[] | null): AuditDisplayItem[] => {
  return (payloads ?? []).map(mapAuditDisplayItem)
}
