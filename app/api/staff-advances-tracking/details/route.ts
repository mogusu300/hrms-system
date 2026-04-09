import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/StaffAdvance";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

export async function GET(req: NextRequest) {
  const documentNo = req.nextUrl.searchParams.get('document_no');
  const documentType = req.nextUrl.searchParams.get('document_type');
  if (!documentNo || !documentType) {
    return NextResponse.json({ error: 'Missing required parameters', details: 'Both document_no and document_type are required' }, { status: 400 });
  }
  try {
    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    // Fetch all staff advances
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
    // Find the matching advance record
    const advances = Array.isArray(data.value) ? data.value : [];
    const advance = advances.find((a: any) => 
      a.Document_No === documentNo && a.Document_Type === documentType
    );
    if (!advance) {
      return NextResponse.json({ error: 'Staff advance not found' }, { status: 404 });
    }
    return NextResponse.json(advance);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch staff advance details', details: String(error) }, { status: 500 });
  }
}