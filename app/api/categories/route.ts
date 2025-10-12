/**
 * API Route: /api/categories
 * Purpose: Fetch active marketplace categories for services and products
 * Methods: GET, POST
 */

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Public client helper (created on-demand to avoid build-time errors)
// Uses anon key for public data - everyone can read categories
function getPublicSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase environment variables (URL or ANON_KEY)');
  }
  
  return createServiceClient(supabaseUrl, anonKey);
}

/**
 * GET /api/categories
 * Fetch active categories, optionally filtered by type
 * 
 * Query Parameters:
 * - type: 'service' | 'product' | 'both' (optional, returns all if not specified)
 * - featured: 'true' | 'false' (optional, filter featured categories)
 * - search: string (optional, search category names)
 * - parent_id: uuid | 'null' (optional, filter by parent category or top-level)
 * - format: 'flat' | 'grouped' (optional, default: flat)
 * 
 * Returns: Array of category objects or grouped hierarchy
 */
export async function GET(request: Request) {
  try {
    const { searchParams} = new URL(request.url);
    
    // Extract query parameters
    const typeFilter = searchParams.get('type');
    const featuredFilter = searchParams.get('featured');
    const searchQuery = searchParams.get('search');
    const parentIdFilter = searchParams.get('parent_id');
    const format = searchParams.get('format');

    // Build query (use public anon key - categories are public data)
    let publicSupabase;
    try {
      publicSupabase = getPublicSupabase();
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    let query = publicSupabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

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

    // Apply parent filter
    if (parentIdFilter === 'null') {
      query = query.is('parent_id', null);
    } else if (parentIdFilter) {
      query = query.eq('parent_id', parentIdFilter);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // If format=grouped, build parent/child structure
    if (format === 'grouped') {
      const grouped = buildCategoryGroups(categories || []);
      return NextResponse.json({ 
        success: true,
        groups: grouped,
        total: categories?.length || 0 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      success: true,
      categories: categories || [],
      total: categories?.length || 0
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Build category groups (parent categories with their children)
 * Used for UI dropdowns/navigation
 */
function buildCategoryGroups(categories: any[]) {
  const parentMap = new Map();
  const children = new Map();

  // Separate parents and children
  categories.forEach(cat => {
    if (cat.parent_id === null) {
      parentMap.set(cat.id, { ...cat, children: [] });
    } else {
      if (!children.has(cat.parent_id)) {
        children.set(cat.parent_id, []);
      }
      children.get(cat.parent_id).push(cat);
    }
  });

  // Attach children to parents
  const groups: any[] = [];
  parentMap.forEach((parent, parentId) => {
    parent.children = children.get(parentId) || [];
    groups.push(parent);
  });

  return groups;
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
