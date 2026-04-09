import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/PurchaseTracking";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

export async function GET(req: NextRequest) {
  const documentNo = req.nextUrl.searchParams.get('document_no');
  if (!documentNo) {
    return NextResponse.json({ error: 'Missing required parameter: document_no' }, { status: 400 });
  }
  try {
    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    // Fetch all purchases
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
    if (!res.ok) {
      return NextResponse.json({ error: `OData error: ${res.status}`, response: raw }, { status: res.status });
    }
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON response from server', details: String(e) }, { status: 500 });
    }
    // Find the matching purchase record
    const purchases = Array.isArray(data.value) ? data.value : [];
    const purchase = purchases.find((p: any) => p.Document_No === documentNo);
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }
    return NextResponse.json(purchase);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch purchase details', details: String(error) }, { status: 500 });
  }
}
