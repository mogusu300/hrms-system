import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/TransportRequest";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

export async function GET(req: NextRequest) {
  const documentNo = req.nextUrl.searchParams.get('document_no');
  if (!documentNo) {
    return NextResponse.json({ error: 'Missing required parameter: document_no' }, { status: 400 });
  }
  try {
    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    // Fetch all transport requests
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
    // Find the matching transport request
    const requests = Array.isArray(data.value) ? data.value : [];
    const request = requests.find((r: any) => r.Document_No === documentNo);
    if (!request) {
      return NextResponse.json({ error: 'Transport request not found' }, { status: 404 });
    }
    return NextResponse.json(request);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch transport request details', details: String(error) }, { status: 500 });
  }
}
