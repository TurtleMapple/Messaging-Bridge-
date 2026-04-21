export type JSendStatus = 'success' | 'fail' | 'error'

export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  [key: string]: unknown
}

export interface ApiResponse<T = unknown> {
  status: JSendStatus
  message?: string
  data?: T
  code?: string
  meta?: ApiMeta
}

export const successResponse = <T>(
  data: T,
  message?: string,
  meta?: ApiMeta
): ApiResponse<T> => {
  const response: ApiResponse<T> = { status: 'success' }
  if (data !== undefined) response.data = data
  if (message) response.message = message
  if (meta) response.meta = meta
  return response
}

export const failResponse = (
  message: string,
  code?: string,
  data?: unknown
): ApiResponse => {
  const response: ApiResponse = { status: 'fail', message }
  if (code) response.code = code
  if (data !== undefined) response.data = data
  return response
}

export const errorResponse = (
  message: string,
  code?: string,
  data?: unknown
): ApiResponse => {
  const response: ApiResponse = { status: 'error', message }
  if (code) response.code = code
  if (data !== undefined) response.data = data
  return response
}
