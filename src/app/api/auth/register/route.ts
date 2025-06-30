import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/response'
import type { RegisterRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { email, password, first_name, last_name, phone } = body

    // Validate input
    if (!email || !password) {
      return validationErrorResponse({
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined
      })
    }

    // Validate password strength
    if (password.length < 8) {
      return validationErrorResponse({
        password: 'Password must be at least 8 characters long'
      })
    }

    const supabase = createClient()

    // Create user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          phone
        }
      }
    })

    if (error) {
      return errorResponse(error.message, 'registration_failed')
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          first_name,
          last_name,
          phone,
          role: 'user',
          status: 'active'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail the registration if profile creation fails
      }
    }

    return successResponse({
      user: data.user,
      session: data.session
    }, 'Registration successful. Please check your email for verification.')

  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse('Registration failed', 'server_error', 500)
  }
}
