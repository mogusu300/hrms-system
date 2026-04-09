'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface FormData {
  date: string;
  currencyCode: string;
  reason: string;
  amountRequired: string;
  noOfInstallments: string;
}

interface StepState {
  headerSubmitted: boolean;
  advanceNumber: string;
  lineSubmitted: boolean;
}

export default function SalaryAdvanceRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loggedInEmployeeNumber, setLoggedInEmployeeNumber] = useState<string>('');
  const [stepState, setStepState] = useState<StepState>({
    headerSubmitted: false,
    advanceNumber: '',
    lineSubmitted: false,
  });

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    currencyCode: 'ZMW',
    reason: '',
    amountRequired: '',
    noOfInstallments: '1',
  });

  // Get employee number from session and fetch employee details on mount
  useEffect(() => {
    const fetchSessionAndEmployeeDetails = async () => {
      try {
        // First, get the session
        const sessionResponse = await fetch('/api/session');
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        
        const sessionData = await sessionResponse.json();
        const empNumber = sessionData.session?.employee_number || sessionData.employeeNumber;
        
        if (!empNumber) throw new Error('No employee number found in session');
        
        setLoggedInEmployeeNumber(empNumber);
        
        // Then fetch employee details (optional - just for future use)
        const encodedEmpNumber = encodeURIComponent(empNumber);
        await fetch(`/api/employee-details?manNumber=${encodedEmpNumber}`).catch(err => {
          console.log('Employee details fetch skipped, not required for salary advance');
        });
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSessionAndEmployeeDetails();
  }, []);

  const validateHeaderForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currencyCode.trim()) {
      newErrors.currencyCode = 'Currency code is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (!formData.amountRequired) {
      newErrors.amountRequired = 'Amount is required';
    } else if (parseFloat(formData.amountRequired) <= 0) {
      newErrors.amountRequired = 'Amount must be greater than 0';
    }

    if (!formData.noOfInstallments) {
      newErrors.noOfInstallments = 'Number of installments is required';
    } else if (parseInt(formData.noOfInstallments) < 1) {
      newErrors.noOfInstallments = 'Installments must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmitHeader = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateHeaderForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix all errors before submitting',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        man_number: loggedInEmployeeNumber,
        date: formData.date,
        currency_code: formData.currencyCode,
        reason: formData.reason,
        amount_required: parseFloat(formData.amountRequired),
        no_of_installments: parseInt(formData.noOfInstallments),
      };

      const response = await fetch('/api/salary-advance/header', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit salary advance header');
      }

      const advanceNumber = data.advance_number || data.advanceNumber;

      setStepState({
        headerSubmitted: true,
        advanceNumber: advanceNumber,
        lineSubmitted: false,
      });

      toast({
        title: 'Success',
        description: `Salary advance header created! Advance #${advanceNumber}`,
      });
    } catch (error: any) {
      console.error('Error submitting salary advance header:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit salary advance header',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLine = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stepState.advanceNumber) {
      toast({
        title: 'Error',
        description: 'Please create a header first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        advance_number: stepState.advanceNumber,
        man_number: loggedInEmployeeNumber,
      };

      const response = await fetch('/api/salary-advance/line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit salary advance line');
      }

      setStepState({
        ...stepState,
        lineSubmitted: true,
      });

      toast({
        title: 'Success',
        description: 'Salary advance line submitted successfully!',
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          currencyCode: 'ZMW',
          reason: '',
          amountRequired: '',
          noOfInstallments: '1',
        });
        setStepState({
          headerSubmitted: false,
          advanceNumber: '',
          lineSubmitted: false,
        });
        setErrors({});
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting salary advance line:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit salary advance line',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-4xl font-bold text-gray-900">Salary Advance Request</h1>
          <p className="text-gray-600 mt-2 text-lg">Submit a salary advance request (2-step process)</p>
        </div>

        {/* Step 1: Create Header */}
        <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${stepState.headerSubmitted ? 'bg-green-50' : 'bg-blue-50'}`}>
              {stepState.headerSubmitted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <FileText className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Step 1: Create Salary Advance Header
              </h2>
              {stepState.headerSubmitted && (
                <p className="text-sm text-green-600 mt-1">✓ Completed - Advance #{stepState.advanceNumber}</p>
              )}
            </div>
          </div>

          {!stepState.headerSubmitted ? (
            <form onSubmit={handleSubmitHeader} className="space-y-6">
              {/* Employee Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-gray-700">
                  Employee: <span className="text-blue-600 font-bold">{loggedInEmployeeNumber || 'Loading...'}</span>
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Request Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="h-11 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500"
                />
              </div>

              {/* Currency Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Currency Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="currencyCode"
                  value={formData.currencyCode}
                  onChange={handleInputChange}
                  placeholder="e.g., ZMW, USD"
                  className={`h-11 text-base rounded-xl border-2 transition-all ${
                    errors.currencyCode
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.currencyCode && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currencyCode}
                  </p>
                )}
              </div>

              {/* Amount Required */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Amount Required <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="amountRequired"
                    value={formData.amountRequired}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className={`h-11 text-base rounded-xl border-2 transition-all ${
                      errors.amountRequired
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.amountRequired && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.amountRequired}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Number of Installments <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="noOfInstallments"
                    value={formData.noOfInstallments}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    className={`h-11 text-base rounded-xl border-2 transition-all ${
                      errors.noOfInstallments
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.noOfInstallments && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.noOfInstallments}
                    </p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Explain the reason for your advance request..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 text-base resize-none transition-all ${
                    errors.reason
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.reason && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.reason}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold rounded-xl gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Header...
                  </>
                ) : (
                  'Step 1: Create Header'
                )}
              </Button>
            </form>
          ) : (
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-semibold">
                ✓ Header created successfully with Advance #{stepState.advanceNumber}
              </p>
              <p className="text-green-700 text-sm mt-2">Proceed to Step 2 to complete your request</p>
            </div>
          )}
        </Card>

        {/* Step 2: Submit Line */}
        <Card className={`p-8 border-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${
          stepState.headerSubmitted
            ? 'border-green-200 bg-white'
            : 'border-gray-200 bg-gray-50 opacity-50'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${stepState.lineSubmitted ? 'bg-green-50' : 'bg-orange-50'}`}>
              {stepState.lineSubmitted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <DollarSign className="w-5 h-5 text-orange-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Step 2: Submit Salary Advance Line
              </h2>
              {stepState.lineSubmitted && (
                <p className="text-sm text-green-600 mt-1">✓ Completed - Request submitted</p>
              )}
            </div>
          </div>

          {stepState.lineSubmitted ? (
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Salary advance request submitted successfully!
              </p>
              <p className="text-green-700 text-sm mt-2">Your request has been processed. You will be redirected shortly.</p>
            </div>
          ) : stepState.headerSubmitted ? (
            <form onSubmit={handleSubmitLine} className="space-y-6">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm font-semibold text-gray-700">
                  Advance Number: <span className="text-orange-600 font-bold">{stepState.advanceNumber}</span>
                </p>
                <p className="text-sm font-semibold text-gray-700 mt-2">
                  Employee: <span className="text-orange-600 font-bold">{loggedInEmployeeNumber}</span>
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold rounded-xl gap-2 bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Step 2: Submit Line & Complete'
                )}
              </Button>
            </form>
          ) : (
            <div className="p-6 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-gray-600 font-semibold">Complete Step 1 first to proceed</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
