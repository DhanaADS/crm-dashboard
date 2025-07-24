import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface OrderCreateRequest {
  clientName: string
  email: string
  tag: string
  orderCount: string
  sites: Array<{
    siteName: string
    keyword: string
    clientLink: string
    sitePrice: number
    articleFee: number
    selectedInventoryId?: string
  }>
  totalBudget: number
  profitMargin: number
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const body: OrderCreateRequest = await request.json()
    
    // Validate budget calculations
    const totalCosts = body.sites.reduce((sum, site) => sum + site.sitePrice + site.articleFee, 0)
    const availableBudget = body.totalBudget * (1 - body.profitMargin / 100)
    
    if (totalCosts > availableBudget) {
      return NextResponse.json(
        { error: 'Order exceeds available budget' },
        { status: 400 }
      )
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}`
    
    // Calculate profit metrics
    const profit = body.totalBudget - totalCosts
    const actualProfitMargin = (profit / body.totalBudget) * 100

    // Insert order into database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        client_name: body.clientName,
        client_email: body.email,
        tag: body.tag,
        order_count: body.orderCount,
        total_budget: body.totalBudget,
        profit_margin: body.profitMargin,
        status: 'Created'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      throw orderError
    }

    // Insert order sites
    const siteInserts = body.sites.map((site) => ({
      order_id: order.id,
      site_name: site.siteName,
      keyword: site.keyword,
      client_link: site.clientLink,
      site_price: site.sitePrice,
      article_fee: site.articleFee,
      inventory_id: site.selectedInventoryId
    }))

    const { error: sitesError } = await supabase
      .from('order_sites')
      .insert(siteInserts)

    if (sitesError) {
      console.error('Sites creation error:', sitesError)
      throw sitesError
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order created successfully',
      data: {
        ...order,
        sites: siteInserts,
        totalCosts,
        profit,
        actualProfitMargin
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}