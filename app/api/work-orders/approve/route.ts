import { NextRequest, NextResponse } from 'next/server';
import { approveRequest, DOCUMENT_TYPE, getEmployeeNumberFromSession } from '@/lib/approval';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { no } = body;

    if (!no) {
      return NextResponse.json({ error: 'no is required' }, { status: 400 });
    }

    // Django Line 1249: Get employee_number from session
    const employeeNumber = getEmployeeNumberFromSession(request.cookies);
    if (!employeeNumber) {
      return NextResponse.json(
        { error: 'Employee number not available' },
        { status: 403 }
      );
    }

    // Call approval function with documentType=17 for Work Order (Django spec)
    const result = await approveRequest(no, DOCUMENT_TYPE.WORK_ORDER, employeeNumber, 'WorkOrder');

    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in work order approval:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}
