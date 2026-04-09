'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestUser {
  employee_number: string;
  full_name: string;
  email: string;
}

export default function TestingToolsPage() {
  const { toast } = useToast();
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTestUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/testing/registered-users');
      if (response.ok) {
        const data = await response.json();
        setTestUsers(data.users || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch registered users',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch test users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-4xl font-bold text-gray-900">Testing Tools</h1>
          <p className="text-gray-600 mt-2 text-lg">Development & Testing Utilities</p>
        </div>

        {/* Security Warning */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Development Only</AlertTitle>
          <AlertDescription className="text-amber-800">
            This page is for testing and development purposes only. This should NEVER be accessible in production.
            It fetches actual registered users from the Business Central system.
          </AlertDescription>
        </Alert>

        {/* Registered Users Section */}
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registered Web Users</CardTitle>
                <CardDescription>View all employees registered in the system</CardDescription>
              </div>
              <Button
                onClick={fetchTestUsers}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {testUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No registered users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Employee Number</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Full Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testUsers.map((user) => (
                      <tr key={user.employee_number} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-900">{user.employee_number}</td>
                        <td className="px-4 py-3 text-gray-900">{user.full_name}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Information Info */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">System Users</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>The table above shows all employees who have been registered as web users in the system.</p>
            <p>These users can log in using their employee number and their registered password.</p>
            <p>To test the system, use your employee credentials or request test access from your administrator.</p>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-3">
            <p>
              <strong>Real User Data:</strong> This page fetches actual registered users from the Business Central system via SOAP API.
            </p>
            <p>
              <strong>Security:</strong> This page should be protected in production and only accessible to developers/QA. Consider adding authentication checks or environment-based visibility.
            </p>
            <p>
              <strong>Production:</strong> Never expose actual user passwords in production. This page is strictly for development and testing.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
