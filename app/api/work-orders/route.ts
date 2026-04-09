import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/ODataV4/Company('Mulonga%20Water%20Supply')/WorkOrders";
const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

export async function GET(req: NextRequest) {
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║         GET ALL WORK ORDERS                        ║');
    console.log('║         (Showing all records)                       ║');
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
      return NextResponse.json([], { status: 200 });
    }
    const workOrders = Array.isArray(data.value) ? data.value : [];
    
    console.log(`\n📊 Total Work Orders from BC: ${workOrders.length}`);
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    return NextResponse.json(workOrders);
  } catch (error: any) {
    console.error('Error in work orders approval:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}
