import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/utils/response'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return errorResponse(error.message, 'logout_failed')
    }

    return successResponse(null, 'Logout successful')

  } catch (error) {
    console.error('Logout error:', error)
    return errorResponse('Logout failed', 'server_error', 500)
  }
}
