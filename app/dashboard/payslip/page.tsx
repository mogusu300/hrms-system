'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
  Download,
} from 'lucide-react';

export default function PayslipPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loggedInEmployeeNumber, setLoggedInEmployeeNumber] = useState<string>('');
  const [payrollPeriod, setPayrollPeriod] = useState('');
  const [payslipData, setPayslipData] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionResponse = await fetch('/api/session');
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();
        const empNumber = sessionData.session?.employee_number || sessionData.employeeNumber;
        if (!empNumber) throw new Error('No employee number found in session');
        setLoggedInEmployeeNumber(empNumber);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!payrollPeriod.trim()) {
      toast({ title: 'Validation Error', description: 'Payroll period is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        payroll_period: payrollPeriod,
        man_number: loggedInEmployeeNumber,
      };

      const response = await fetch('/api/payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to generate payslip');

      setPayslipData(data.result);
      setGenerated(true);
      toast({ title: 'Success', description: 'Payslip generated successfully' });
    } catch (error: any) {
      console.error('Error generating payslip:', error);
      toast({ title: 'Error', description: error.message || 'Failed to generate payslip', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="pt-4">
          <h1 className="text-4xl font-bold text-gray-900">Payslip</h1>
          <p className="text-gray-600 mt-2 text-lg">Generate and view your payslip for a specific period</p>
        </div>

        <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${generated ? 'bg-green-50' : 'bg-blue-50'}`}>
              {generated ? <CheckCircle className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {generated ? 'Payslip Generated' : 'Generate Payslip'}
            </h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold text-gray-700">
                Employee: <span className="text-blue-600 font-bold">{loggedInEmployeeNumber || 'Loading...'}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Payroll Period <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={payrollPeriod}
                onChange={(e) => setPayrollPeriod(e.target.value)}
                placeholder="e.g. 2026-03, March 2026"
                className="h-11 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500"
              />
              <p className="text-gray-500 text-sm mt-2">Enter the payroll period identifier as used in Business Central</p>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-xl gap-2 bg-blue-600 hover:bg-blue-700">
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Generating...</>) : (<><Download className="w-5 h-5" /> Generate Payslip</>)}
            </Button>
          </form>

          {generated && payslipData && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payslip Data</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-white p-4 rounded-lg border overflow-x-auto">
                {payslipData}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
