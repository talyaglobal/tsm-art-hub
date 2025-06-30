import { createBrowserClient } from "@supabase/ssr"
import { config } from "@/lib/config/environment"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(config.supabase.url, config.supabase.anonKey)
  }

  return supabaseClient
}

export async function getSession() {
  const supabase = createClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUser() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error signing in:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error signing in:", error)
    return { data: null, error }
  }
}

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      console.error("Error signing up:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error signing up:", error)
    return { data: null, error }
  }
}

export async function signOut() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error }
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      console.error("Error resetting password:", error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { error }
  }
}

export async function updatePassword(password: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error("Error updating password:", error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error("Error updating password:", error)
    return { error }
  }
}

export async function updateProfile(updates: Record<string, any>) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) {
      console.error("Error updating profile:", error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error }
  }
}
