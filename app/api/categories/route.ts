/**
 * API Route: /api/categories
 * Purpose: Fetch active marketplace categories for services and products
 * Methods: GET
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/categories
 * Fetch active categories, optionally filtered by type
 * 
 * Query Parameters:
 * - type: 'service' | 'product' | 'both' (optional, returns all if not specified)
 * - featured: 'true' | 'false' (optional, filter featured categories)
 * - search: string (optional, search category names)
 * 
 * Returns: Array of category objects
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const typeFilter = searchParams.get('type');
    const featuredFilter = searchParams.get('featured');
    const searchQuery = searchParams.get('search');

    // Build query
    let query = supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    // Apply type filter (service, product, or both)
    if (typeFilter && ['service', 'product', 'both'].includes(typeFilter)) {
      // For services: show 'service' and 'both' categories
      // For products: show 'product' and 'both' categories
      if (typeFilter === 'service') {
        query = query.in('type', ['service', 'both']);
      } else if (typeFilter === 'product') {
        query = query.in('type', ['product', 'both']);
      } else {
        query = query.eq('type', typeFilter);
      }
    }

    // Apply featured filter
    if (featuredFilter === 'true') {
      query = query.eq('is_featured', true);
    }

    // Apply search filter (case-insensitive)
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.ilike('name', `%${searchQuery.trim()}%`);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Submit a new custom category for admin approval
 * Requires authentication
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, type, description } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (type && !['service', 'product', 'both'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid category type' },
        { status: 400 }
      );
    }

    // Check if category already exists (case-insensitive)
    const { data: existing } = await supabase
      .from('categories')
      .select('id, name, status')
      .ilike('name', name.trim())
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json(
          { error: `Category "${existing.name}" already exists` },
          { status: 409 }
        );
      } else if (existing.status === 'pending') {
        return NextResponse.json(
          { error: `Category "${existing.name}" is already pending approval` },
          { status: 409 }
        );
      }
    }

    // Insert new category (status = pending for user submissions)
    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        type: type || 'service',
        description: description?.trim() || null,
        status: 'pending',
        created_by: user.id,
        sort_order: 9999, // User submissions go to end
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating category:', insertError);
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Category submitted for approval',
        category: newCategory 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
