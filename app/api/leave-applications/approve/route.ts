import { NextRequest, NextResponse } from 'next/server';
import { approveRequest, DOCUMENT_TYPE, getEmployeeNumberFromSession } from '@/lib/approval';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leave_no } = body;

    if (!leave_no) {
      return NextResponse.json({ error: 'leave_no is required' }, { status: 400 });
    }

    // Django Line 1249: Get employee_number from session
    const employeeNumber = getEmployeeNumberFromSession(request.cookies);
    if (!employeeNumber) {
      return NextResponse.json(
        { error: 'Employee number not available' },
        { status: 403 }
      );
    }

    // Call approval function with documentType=11 for Leave (Django line 1131)
    const result = await approveRequest(leave_no, DOCUMENT_TYPE.LEAVE, employeeNumber, 'LeaveApplication');

    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in leave approval:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}
