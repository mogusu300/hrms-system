import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = "http://41.216.68.50:7248/BusinessCentral142/ODataV4/Company('Mulonga%20Water%20Supply')/ItemList";
    const basicAuth = Buffer.from('WEBUSER:Pass@123!$').toString('base64');

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  FETCH ITEMS FROM BUSINESS CENTRAL - OData API                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`📍 URL: ${apiUrl}`);
    console.log(`📌 Method: GET`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Authorization: Basic [REDACTED]`);
    console.log(`   • Content-Type: application/json\n`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();

    console.log(`╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  ODATA RESPONSE - ItemList                                    ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`════════════════════════════════════════════════════════════════`);
    console.log(responseText.substring(0, 500) + '...');
    console.log(`════════════════════════════════════════════════════════════════\n`);

    if (response.status !== 200) {
      console.error(`❌ Error: Failed to fetch items from Business Central`);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch items',
          value: [],
        },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    const items = data.value || [];

    console.log(`✅ SUCCESS: Retrieved ${items.length} items from Business Central\n`);

    return NextResponse.json({
      success: true,
      value: items,
    });
  } catch (error: any) {
    console.error('\n❌ Unexpected error fetching items:');
    console.error(error);
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected error occurred',
        error: error.message,
        value: [],
      },
      { status: 500 }
    );
  }
}
