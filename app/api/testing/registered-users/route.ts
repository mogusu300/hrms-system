import { NextRequest, NextResponse } from 'next/server';
import { requiresDevelopmentOnly } from '@/lib/testing-auth';

/**
 * DEVELOPMENT ONLY - Testing API Endpoint
 * Fetches actual registered web users from Business Central OData API
 * 
 * ⚠️ SECURITY WARNING: This endpoint should NEVER be accessible in production
 * Protected by environment checks - will return 404 in production
 */

// Business Central OData endpoint
const ODATA_URL = 'http://41.216.68.50:7247/BusinessCentral142/ODataV4/Company(\'Mulonga%20Water%20Supply\')/WebUser';
const AUTH_USERNAME = 'WEBUSER';
const AUTH_PASSWORD = 'Pass@123!$';

const getAuthHeader = () => {
  const credentials = Buffer.from(`${AUTH_USERNAME}:${AUTH_PASSWORD}`).toString('base64');
  return `Basic ${credentials}`;
};

async function getRegisteredWebUsers(): Promise<Array<{ employee_number: string; full_name: string; email: string }>> {
  try {
    // Fetch web users from OData API
    const response = await fetch(ODATA_URL, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`\n📊 OData Response Status: ${response.status}`);

    if (!response.ok) {
      console.log(`ℹ️  OData request failed with status ${response.status}, returning empty list`);
      return [];
    }

    const data = await response.json();
    const users: Array<{ employee_number: string; full_name: string; email: string }> = [];

    // Extract users from OData response
    // OData returns data in a 'value' array
    if (data.value && Array.isArray(data.value)) {
      data.value.forEach((user: any) => {
        // Map OData fields to our interface
        // Assuming fields like: "User ID" (employee number), "Full Name", "Contact Email"
        users.push({
          employee_number: user['User ID'] || user.userId || user.number || '',
          full_name: user['Full Name'] || user.fullName || user.name || '',
          email: user['Contact Email'] || user.contactEmail || user.email || ''
        });
      });
    }

    console.log(`✅ Retrieved ${users.length} registered web users from Business Central OData`);
    return users;
  } catch (error) {
    console.error('Error getting registered web users from OData:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // ⚠️ SECURITY CHECK - Block in production
    const productionBlock = requiresDevelopmentOnly(request);
    if (productionBlock) {
      return productionBlock;
    }

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║    📋 REGISTERED USERS LIST REQUEST (DEV ONLY)    ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    console.log('🔄 Fetching registered web users from Business Central OData API...');

    // Fetch actual registered users from Business Central
    const users = await getRegisteredWebUsers();

    console.log('⚠️  This endpoint is for development/testing only');
    console.log('🛡️  SECURITY: This endpoint is disabled in production');
    console.log('\n' + '═'.repeat(61) + '\n');

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        users: users,
        note: 'DEVELOPMENT ONLY - Actual registered users from Business Central OData API',
        warning: 'Never expose this endpoint in production',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching registered users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registered users' },
      { status: 500 }
    );
  }
}
