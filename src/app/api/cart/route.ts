import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response'
import type { AddToCartRequest } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return unauthorizedResponse('Please login to view cart')
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return errorResponse(error.message, 'cart_fetch_failed')
    }

    // Calculate cart totals
    const subtotal = data?.reduce((total, item) => {
      const price = item.price || item.products?.price || 0
      return total + (price * item.quantity)
    }, 0) || 0

    const itemCount = data?.reduce((total, item) => total + item.quantity, 0) || 0

    return successResponse({
      items: data || [],
      summary: {
        itemCount,
        subtotal,
        total: subtotal // Add tax/shipping calculation here if needed
      }
    })

  } catch (error) {
    console.error('Cart fetch error:', error)
    return errorResponse('Failed to fetch cart', 'server_error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return unauthorizedResponse('Please login to add items to cart')
    }

    const body: AddToCartRequest = await request.json()
    const { product_id, quantity, warranty_sku, shop_id } = body

    if (!product_id || !quantity || quantity <= 0) {
      return errorResponse('Invalid product or quantity', 'validation_error')
    }

    // Check if product exists and is available
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('status', 'active')
      .single()

    if (productError || !product) {
      return errorResponse('Product not found or unavailable', 'product_not_found')
    }

    // Check stock availability
    if (product.manage_stock && product.stock_quantity < quantity) {
      return errorResponse('Insufficient stock', 'insufficient_stock')
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity
      
      // Check stock for new quantity
      if (product.manage_stock && product.stock_quantity < newQuantity) {
        return errorResponse('Insufficient stock for requested quantity', 'insufficient_stock')
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select(`
          *,
          products(*)
        `)
        .single()

      if (error) {
        return errorResponse(error.message, 'cart_update_failed')
      }

      return successResponse(data, 'Cart updated successfully')
    } else {
      // Add new item to cart
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id,
          quantity,
          price: product.sale_price || product.price,
          warranty_sku,
          shop_id
        })
        .select(`
          *,
          products(*)
        `)
        .single()

      if (error) {
        return errorResponse(error.message, 'cart_add_failed')
      }

      return successResponse(data, 'Item added to cart successfully')
    }

  } catch (error) {
    console.error('Add to cart error:', error)
    return errorResponse('Failed to add item to cart', 'server_error', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return unauthorizedResponse('Please login to clear cart')
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return errorResponse(error.message, 'cart_clear_failed')
    }

    return successResponse(null, 'Cart cleared successfully')

  } catch (error) {
    console.error('Clear cart error:', error)
    return errorResponse('Failed to clear cart', 'server_error', 500)
  }
}
