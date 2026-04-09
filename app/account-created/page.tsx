'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, User, ArrowRight } from 'lucide-react';

function AccountCreatedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get user details from URL search params
    const name = searchParams.get('name') || 'User';
    const email = searchParams.get('email') || '';
    setUserName(name);
    setUserEmail(email);

    // Auto-redirect to login after 5 seconds
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router, searchParams]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Account Created Successfully
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Your HRMS account is now ready to use
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message Box */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <p className="text-gray-700 text-sm">
              Welcome to HRMS! Your account has been activated and you can now access all HR features.
            </p>
          </div>

          {/* User Details Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            {userName && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900 truncate">{userName}</p>
                </div>
              </div>
            )}

            {userEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Email Address</p>
                  <p className="font-semibold text-gray-900 truncate">{userEmail}</p>
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <ArrowRight className="w-4 h-4 text-gray-700" />
              Next Steps
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold leading-none mt-0.5">✓</span>
                <span>Your web user has been created in Business Central</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold leading-none mt-0.5">✓</span>
                <span>Your password has been securely stored</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold leading-none mt-0.5">✓</span>
                <span>You can now log in and access all HR features</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-auto rounded-lg transition-colors"
            >
              Go to Login
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-600">
                Redirecting to login in{' '}
                <span className="font-semibold text-gray-900">{redirectCountdown}</span>{' '}
                second{redirectCountdown !== 1 ? 's' : ''}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountCreatedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AccountCreatedContent />
    </Suspense>
  );
}
