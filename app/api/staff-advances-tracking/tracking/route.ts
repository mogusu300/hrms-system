import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/StaffAdvance";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

export async function GET(req: NextRequest) {
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  GET STAFF ADVANCES TRACKING (All Requests)        ║');
    console.log('║  (Showing all records)                             ║');
    console.log('╚════════════════════════════════════════════════════╝');
    
    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    const res = await fetch(ODATA_URL, {
      headers: {
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Authorization': `Basic ${basicAuth}`,
      },
      method: 'GET',
    });
    const raw = await res.text();
    if (!res.ok) throw new Error(`OData error: ${res.status}`);
    
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.log('❌ Failed to parse OData response');
      return NextResponse.json([], { status: 200 });
    }
    
    const advances = Array.isArray(data.value) ? data.value : [];
    console.log(`\n📊 Total Staff Advance Records from BC: ${advances.length}`);
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    return NextResponse.json(advances);
  } catch (error: any) {
    console.error('Error in staff advances tracking:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}
