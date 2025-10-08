/**
 * Debug Flutter Auth Access - Test what a driver can see with anon key
 * This script simulates the exact same database access that Flutter app uses
 */

const { createClient } = require('@supabase/supabase-js');

// Use the SAME credentials as Flutter app
const supabaseUrl = 'https://sztfvlzxvurqcjzzthtd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6dGZ2bHp4dnVycWNqenp0aHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjA2MzcsImV4cCI6MjA2MzgzNjYzN30.1G7EJfdmHlr8_WOBGG3BeyWcdDGqCor3FA6Q_WeB4Iw'; // anon key - same as Flutter

console.log('🔍 DEBUGGING FLUTTER AUTH ACCESS');
console.log('================================');
console.log(`🗄️  Database: ${supabaseUrl}`);
console.log(`🔑 Using anon key (same as Flutter app)`);

async function debugFlutterAuthAccess() {
    const supabase = createClient(supabaseUrl, anonKey);
    
    try {
        // 1. Test driver authentication (simulating Flutter app login)
        console.log('\n1️⃣ SIMULATING FLUTTER DRIVER LOGIN');
        const driverUserId = 'df4e3e5d-9012-4256-9aa0-4a26c0f7a27f';
        const driverEmail = 'gwida@gmail.com';
        
        // Sign in with email/password (simulating what Flutter does)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: driverEmail,
            password: 'test123' // Try common passwords
        });
        
        if (authError) {
            console.log(`❌ Auth failed: ${authError.message}`);
            // Try different password
            const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
                email: driverEmail,
                password: 'password'
            });
            
            if (authError2) {
                console.log(`❌ Auth failed again: ${authError2.message}`);
                console.log('🔄 Continuing without authentication to test RLS...');
            } else {
                console.log(`✅ Authenticated as: ${authData2.user.email}`);
                console.log(`👤 User ID: ${authData2.user.id}`);
            }
        } else {
            console.log(`✅ Authenticated as: ${authData.user.email}`);
            console.log(`👤 User ID: ${authData.user.id}`);
        }
        
        // 2. Test suppliers query (exact same as Flutter app)
        console.log('\n2️⃣ TESTING SUPPLIERS QUERY (same as Flutter app)');
        console.log('Query: SELECT id, company_name FROM suppliers LIMIT 10');
        
        const { data: suppliersData, error: suppliersError } = await supabase
            .from('suppliers')
            .select('id, company_name')
            .limit(10);
            
        if (suppliersError) {
            console.log(`❌ Suppliers query failed: ${suppliersError.message}`);
            console.log(`📊 Error details:`, suppliersError);
        } else {
            console.log(`✅ Suppliers query success: Found ${suppliersData.length} suppliers`);
            suppliersData.forEach((supplier, index) => {
                console.log(`   ${index + 1}. ${supplier.company_name} (${supplier.id})`);
            });
        }
        
        // 3. Test specific supplier lookup (what's failing in Flutter)
        console.log('\n3️⃣ TESTING SPECIFIC SUPPLIER LOOKUP');
        const targetSupplierId = '6d0e4c58-f74b-4ca2-89e9-6e358e253f7f';
        console.log(`Query: SELECT * FROM suppliers WHERE id = '${targetSupplierId}'`);
        
        const { data: specificSupplier, error: specificError } = await supabase
            .from('suppliers')
            .select('id, company_name, address, phone, email')
            .eq('id', targetSupplierId)
            .maybeSingle();
            
        if (specificError) {
            console.log(`❌ Specific supplier query failed: ${specificError.message}`);
            console.log(`📊 Error details:`, specificError);
        } else if (!specificSupplier) {
            console.log(`❌ Specific supplier not found`);
        } else {
            console.log(`✅ Specific supplier found: ${specificSupplier.company_name}`);
            console.log(`📋 Details:`, specificSupplier);
        }
        
        // 4. Test RLS policies check
        console.log('\n4️⃣ CHECKING RLS POLICIES');
        
        // Check if we can see any data at all
        const tables = ['suppliers', 'supplier_auth_tokens', 'supplier_drivers', 'drivers'];
        
        for (const table of tables) {
            console.log(`\n🔍 Testing access to "${table}" table:`);
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                    
                if (error) {
                    console.log(`   ❌ ${error.message}`);
                } else {
                    console.log(`   ✅ Accessible - Found ${data.length} records`);
                }
            } catch (e) {
                console.log(`   ❌ Exception: ${e.message}`);
            }
        }
        
    } catch (error) {
        console.error('💥 Debug script error:', error);
    }
}

// Run the debug
debugFlutterAuthAccess()
    .then(() => {
        console.log('\n✅ Debug completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
