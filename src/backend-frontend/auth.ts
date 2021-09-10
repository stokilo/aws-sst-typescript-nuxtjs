import * as zod from 'zod'

/**
 * What we receive for access token from facebook OAuth
 */
export const OAuth2AccessTokenSchema = zod.object({
  access_token: zod.string().min(3).max(500)
})
export type OAuth2AccessToken = zod.TypeOf<typeof OAuth2AccessTokenSchema>

/**
 * What we receive for user data from facebook OAuth
 */
export const FacebookUserDataSchema = zod.object({
  email: zod.string().min(3).max(500).email(),
  first_name: zod.string().min(3).max(500),
  last_name: zod.string().min(3).max(500)
})
export type FacebookUserData = zod.TypeOf<typeof FacebookUserDataSchema>

/**
 * What we receive for usre data from google OAuth
 */
export const GoogleUserDataSchema = zod.object({
  id: zod.optional(zod.string()),
  email: zod.string(),
  verified_email: zod.boolean(),
  name: zod.string(),
  given_name: zod.string(),
  family_name: zod.string(),
  picture: zod.optional(zod.string()),
  locale: zod.optional(zod.string())
})
export type GoogleUserData = zod.TypeOf<typeof GoogleUserDataSchema>

/**
 * Personal user data.
 */
export const UserDataSchema = zod.object({
  email: zod.string().min(3).max(1024).email(),
  firstName: zod.string().min(3).max(255),
  lastName: zod.string().min(3).max(255)
})
export type UserData = zod.TypeOf<typeof UserDataSchema>

export const AuthAndRefreshJwtTokenSchema = zod.object({
  authToken: zod.string().min(1).max(7 * 1024),
  refreshToken: zod.string().min(1).max(7 * 1024)
})
export type AuthAndRefreshJwtToken = zod.TypeOf<typeof AuthAndRefreshJwtTokenSchema>

/**
 * Generated tokens for the user.
 */
export const AuthAndRefreshJwtTokenSecretsSchema = zod.object({
  authTokenSecret: zod.string().uuid(),
  refreshTokenSecret: zod.string().uuid()
})
export type AuthAndRefreshJwtTokenSecrets = zod.TypeOf<typeof AuthAndRefreshJwtTokenSecretsSchema>

/**
 * What we save in dynamodb for tmp access code
 */
export const AccessCodeSchema = zod.object({
  code: zod.string(),
  createdAt: zod.number(),
  isActive: zod.boolean()
})
export type AccessCode = zod.TypeOf<typeof AccessCodeSchema>

/**
 * OAuth to app user data mapping
 */
export const OAuthEntitySchema = zod.object({
  userId: zod.string()
})
export type OAuthEntity = zod.TypeOf<typeof OAuthEntitySchema>

/**
 * App config settings
 */
export const UserSettingsSchema = zod.object({
  darkMode: zod.boolean()
})
export type UserSettings = zod.TypeOf<typeof UserSettingsSchema>

/**
 * Authorization settings
 */
export const UserRightsSchema = zod.object({
  isAdmin: zod.boolean()
})
export type UserRights = zod.TypeOf<typeof UserRightsSchema>

/**
 * What we save in dynamodb for user entity
 */
export const UserSchema = zod.object({
  userData: UserDataSchema,
  accessCode: AccessCodeSchema,
  tokens: AuthAndRefreshJwtTokenSchema,
  tokensSecrets: AuthAndRefreshJwtTokenSecretsSchema,
  settings: UserSettingsSchema,
  rights: UserRightsSchema
})
export type User = zod.TypeOf<typeof UserSchema>

export const OAuthStep2ResponseSchema = zod.object({
  tokens: AuthAndRefreshJwtTokenSchema,
  settings: UserSettingsSchema,
  userData: UserDataSchema
})
export type OAuthStep2Response = zod.TypeOf<typeof OAuthStep2ResponseSchema>

export function faceBookUserDataConverter (facebookUserData: FacebookUserData): UserData {
  const mapAll = { ...facebookUserData, firstName: facebookUserData.first_name, lastName: facebookUserData.last_name }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,camelcase
  const { first_name, last_name, ...mapFinal } = mapAll
  return mapFinal
}

export function googleUserDataConverter (googleUserData: GoogleUserData): UserData {
  const mapAll = { ...googleUserData, email: googleUserData.email, firstName: googleUserData.given_name, lastName: googleUserData.family_name }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,camelcase
  const { id, name, picture, locale, ...mapFinal } = mapAll
  return mapFinal
}
