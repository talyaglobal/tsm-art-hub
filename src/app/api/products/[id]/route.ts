import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const fields = searchParams.get('fields')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const shopId = searchParams.get('shopId')

    const supabase = createClient()

    let selectFields = '*'
    if (fields === 'FULL') {
      selectFields = `
        *,
        categories(*),
        stock_locations(*)
      `
    }

    const { data, error } = await supabase
      .from('products')
      .select(selectFields)
      .eq('id', params.id)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse('Product not found')
      }
      return errorResponse(error.message, 'product_fetch_failed')
    }

    // If location data is provided, fetch stock information
    if (latitude && longitude && data) {
      // This would typically call an external service or calculate distance
      // For now, we'll just add the location data to the response
      data.location_data = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        shopId
      }
    }

    return successResponse(data)

  } catch (error) {
    console.error('Product fetch error:', error)
    return errorResponse('Failed to fetch product', 'server_error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return errorResponse('Unauthorized', 'unauthorized', 401)
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return errorResponse('Forbidden', 'forbidden', 403)
    }

    const updates = await request.json()

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse('Product not found')
      }
      return errorResponse(error.message, 'product_update_failed')
    }

    return successResponse(data, 'Product updated successfully')

  } catch (error) {
    console.error('Product update error:', error)
    return errorResponse('Failed to update product', 'server_error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return errorResponse('Unauthorized', 'unauthorized', 401)
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return errorResponse('Forbidden', 'forbidden', 403)
    }

    // Soft delete by updating status
    const { data, error } = await supabase
      .from('products')
      .update({ status: 'inactive' })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse('Product not found')
      }
      return errorResponse(error.message, 'product_delete_failed')
    }

    return successResponse(data, 'Product deleted successfully')

  } catch (error) {
    console.error('Product delete error:', error)
    return errorResponse('Failed to delete product', 'server_error', 500)
  }
}
