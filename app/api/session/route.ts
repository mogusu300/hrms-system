import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Django line 431: Sets session['employee_number']
    return NextResponse.json({
      session: {
        employee_number: sessionData.employee_number,
      }
    });
  } catch (error) {
    console.error('Error reading session:', error);
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 400 }
    );
  }
}
