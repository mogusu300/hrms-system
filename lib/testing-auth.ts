import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect development-only routes
 * Ensures testing endpoints are not accessible in production
 */

export function isProductionEnvironment(): boolean {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
  return isProduction;
}

export function isDevelopmentEnvironment(): boolean {
  return !isProductionEnvironment();
}

export function requiresDevelopmentOnly(request: NextRequest): NextResponse | null {
  if (isProductionEnvironment()) {
    console.warn(`⛔ [SECURITY] Blocked access to development endpoint: ${request.nextUrl.pathname}`);
    return NextResponse.json(
      { error: 'This endpoint is not available' },
      { status: 404 }
    );
  }
  return null;
}

export function getTestingApiKey(): string {
  return process.env.TESTING_API_KEY || 'dev-key';
}

export function validateTestingApiKey(providedKey: string): boolean {
  const expectedKey = getTestingApiKey();
  return providedKey === expectedKey;
}
