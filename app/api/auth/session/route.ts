import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);

    // Django stores 'employee_number' in session
    // Return session object matching Django structure
    return NextResponse.json({
      success: true,
      session: {
        employee_number: session.employee_number,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
}
