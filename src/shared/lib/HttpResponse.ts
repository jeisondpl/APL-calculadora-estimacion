export interface HttpResponse<T> {
  error: boolean
  response?: T
  msg?: string
  code?: number
}

export function successResponse<T>(data: T, msg?: string): HttpResponse<T> {
  return { error: false, response: data, msg }
}

export function errorResponse(msg: string, code?: number): HttpResponse<never> {
  return { error: true, msg, code }
}
