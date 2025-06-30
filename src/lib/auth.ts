export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

export function isAuthenticated(): boolean {
  const token = getAuthToken()
  return token !== null && token !== ""
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    window.location.href = "/login"
  }
}

export function requireAuth(): boolean {
  if (!isAuthenticated()) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return false
  }
  return true
}
