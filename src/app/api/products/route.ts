import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/utils/response'
import type { ProductSearchParams } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params: ProductSearchParams = {
      query: searchParams.get('query') || undefined,
      type: searchParams.get('type') || undefined,
      currentPage: parseInt(searchParams.get('currentPage') || '0'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sort: searchParams.get('sort') || 'created_at',
      fields: searchParams.get('fields') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      inStock: searchParams.get('inStock') === 'true'
    }

    const supabase = createClient()
    
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `, { count: 'exact' })

    // Apply filters
    if (params.query) {
      query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%,sku.ilike.%${params.query}%`)
    }

    if (params.categoryId) {
      query = query.eq('category_id', params.categoryId)
    }

    if (params.minPrice !== undefined) {
      query = query.gte('price', params.minPrice)
    }

    if (params.maxPrice !== undefined) {
      query = query.lte('price', params.maxPrice)
    }

    if (params.inStock) {
      query = query.eq('in_stock', true)
    }

    // Only show active products
    query = query.eq('status', 'active')

    // Apply sorting
    const [sortField, sortOrder] = params.sort.split(':')
    query = query.order(sortField, { ascending: sortOrder !== 'desc' })

    // Apply pagination
    const from = params.currentPage * params.pageSize
    const to = from + params.pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return errorResponse(error.message, 'products_fetch_failed')
    }

    const totalPages = Math.ceil((count || 0) / params.pageSize)

    return successResponse({
      products: data || [],
      pagination: {
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        totalPages,
        totalResults: count || 0
      }
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return errorResponse('Failed to fetch products', 'server_error', 500)
  }
}

export async function POST(request: NextRequest) {
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

    const product = await request.json()

    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'product_creation_failed')
    }

    return successResponse(data, 'Product created successfully')

  } catch (error) {
    console.error('Product creation error:', error)
    return errorResponse('Failed to create product', 'server_error', 500)
  }
}
