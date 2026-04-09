import { NextRequest, NextResponse } from 'next/server';
import { approveRequest, DOCUMENT_TYPE, getEmployeeNumberFromSession } from '@/lib/approval';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_no } = body;

    if (!document_no) {
      return NextResponse.json({ error: 'document_no is required' }, { status: 400 });
    }

    // Django Line 1249: Get employee_number from session
    const employeeNumber = getEmployeeNumberFromSession(request.cookies);
    if (!employeeNumber) {
      return NextResponse.json(
        { error: 'Employee number not available' },
        { status: 403 }
      );
    }

    // Call approval function with documentType=13 for Transport Request (Django line 1139)
    const result = await approveRequest(document_no, DOCUMENT_TYPE.TRANSPORT, employeeNumber, 'TransportRequest');

    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in transport request approval:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}
