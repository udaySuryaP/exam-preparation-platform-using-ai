/**
 * Setup script to execute schema.sql against Supabase.
 * 
 * Usage: node scripts/setup-db.mjs
 * 
 * Requires SUPABASE_DB_URL in .env.local
 * Get it from: Supabase Dashboard → Settings → Database → Connection string (URI)
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

// Split SQL into individual statements and execute
const schemaSQL = readFileSync('supabase/schema.sql', 'utf-8');

// Split by semicolons but handle $$ blocks (functions)
function splitStatements(sql) {
    const statements = [];
    let current = '';
    let inDollarBlock = false;

    const lines = sql.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();

        // Skip comments
        if (trimmed.startsWith('--') && !inDollarBlock) {
            continue;
        }

        if (trimmed.includes('$$')) {
            const count = (trimmed.match(/\$\$/g) || []).length;
            if (count % 2 === 1) {
                inDollarBlock = !inDollarBlock;
            }
        }

        current += line + '\n';

        if (trimmed.endsWith(';') && !inDollarBlock) {
            const stmt = current.trim();
            if (stmt && stmt !== ';') {
                statements.push(stmt);
            }
            current = '';
        }
    }

    if (current.trim()) {
        statements.push(current.trim());
    }

    return statements;
}

async function runSetup() {
    console.log('🚀 Setting up Supabase database...\n');

    const statements = splitStatements(schemaSQL);
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        const preview = stmt.substring(0, 80).replace(/\n/g, ' ');

        try {
            const { error } = await supabase.rpc('exec_sql', { sql: stmt });

            if (error) {
                // Try if it's a known "already exists" error
                if (error.message?.includes('already exists') ||
                    error.message?.includes('duplicate')) {
                    console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
                    skipped++;
                } else {
                    console.log(`❌ [${i + 1}/${statements.length}] Failed: ${preview}...`);
                    console.log(`   Error: ${error.message}\n`);
                    failed++;
                }
            } else {
                console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
                success++;
            }
        } catch (err) {
            console.log(`❌ [${i + 1}/${statements.length}] Failed: ${preview}...`);
            console.log(`   Error: ${err.message}\n`);
            failed++;
        }
    }

    console.log(`\n📊 Results: ${success} succeeded, ${skipped} skipped, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 Database setup complete!');
    } else {
        console.log('\n⚠️  Some statements failed. You may need to run them manually in the Supabase SQL Editor.');
        console.log('   Dashboard: https://supabase.com/dashboard/project/trmyfsrtkxjktjfqndkn/sql/new');
    }
}

runSetup();
