'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface FormData {
  advanceDate: string;
  advanceCategory: string;
  currency: string;
  amount: string;
  promisedRetirementDate: string;
  advanceReason: string;
  detailedDescription: string;
}

const ADVANCE_CATEGORIES = [
  { value: '1', label: 'Travel' },
  { value: '2', label: 'Medical' },
  { value: '3', label: 'Other' },
];

const CURRENCIES = [
  { value: 'ZMW', label: 'ZMW' },
  { value: 'USD', label: 'USD' },
];

export default function CashAdvanceRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loggedInEmployeeNumber, setLoggedInEmployeeNumber] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    advanceDate: new Date().toISOString().split('T')[0],
    advanceCategory: '',
    currency: 'ZMW',
    amount: '',
    promisedRetirementDate: '',
    advanceReason: '',
    detailedDescription: '',
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
          console.log('Employee details fetch skipped, not required for cash advance');
        });
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSessionAndEmployeeDetails();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.advanceCategory) {
      newErrors.advanceCategory = 'Advance category is required';
    }

    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.promisedRetirementDate) {
      newErrors.promisedRetirementDate = 'Promised retirement date is required';
    } else if (new Date(formData.promisedRetirementDate) <= new Date(formData.advanceDate)) {
      newErrors.promisedRetirementDate = 'Retirement date must be after advance date';
    }

    if (!formData.advanceReason.trim()) {
      newErrors.advanceReason = 'Advance reason is required';
    }

    if (!formData.detailedDescription.trim()) {
      newErrors.detailedDescription = 'Detailed description is required';
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
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
        advance_date: formData.advanceDate,
        advance_category: formData.advanceCategory,
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        promised_retirement_date: formData.promisedRetirementDate,
        advance_reason: formData.advanceReason,
        detailed_description: formData.detailedDescription,
      };

      const response = await fetch('/api/cash-advance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit cash advance');
      }

      setSubmitted(true);

      toast({
        title: 'Success',
        description: 'Cash advance request submitted successfully!',
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          advanceDate: new Date().toISOString().split('T')[0],
          advanceCategory: '',
          currency: 'ZMW',
          amount: '',
          promisedRetirementDate: '',
          advanceReason: '',
          detailedDescription: '',
        });
        setSubmitted(false);
        setErrors({});
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting cash advance:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit cash advance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 border-2 border-green-200 rounded-2xl bg-green-50 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-800 mb-2">Success!</h2>
            <p className="text-green-700 text-lg mb-4">
              Your cash advance request has been submitted successfully.
            </p>
            <p className="text-green-600">
              You will be redirected to the dashboard shortly...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-4xl font-bold text-gray-900">Cash Advance Request</h1>
          <p className="text-gray-600 mt-2 text-lg">Submit a cash advance claim</p>
        </div>

        {/* Main Form Card */}
        <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Employee Information Section */}
            <div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
                <p className="text-sm font-semibold text-gray-700">
                  Employee: <span className="text-blue-600 font-bold">{loggedInEmployeeNumber || 'Loading...'}</span>
                </p>
              </div>

              {/* Row 1: Date and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Advance Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="advanceDate"
                    value={formData.advanceDate}
                    onChange={handleInputChange}
                    className="h-11 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Advance Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="advanceCategory"
                    value={formData.advanceCategory}
                    onChange={handleInputChange}
                    className={`w-full h-11 px-4 border-2 rounded-xl focus:outline-none focus:ring-0 text-base transition-all ${
                      errors.advanceCategory
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {ADVANCE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.advanceCategory && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.advanceCategory}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Currency and Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className={`w-full h-11 px-4 border-2 rounded-xl focus:outline-none focus:ring-0 text-base transition-all ${
                      errors.currency
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                  {errors.currency && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.currency}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`h-11 text-base rounded-xl border-2 transition-all ${
                      errors.amount
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.amount && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.amount}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Promised Retirement Date */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Promised Retirement Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="promisedRetirementDate"
                  value={formData.promisedRetirementDate}
                  onChange={handleInputChange}
                  className={`h-11 text-base rounded-xl border-2 transition-all ${
                    errors.promisedRetirementDate
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.promisedRetirementDate && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.promisedRetirementDate}
                  </p>
                )}
              </div>

              {/* Row 4: Advance Reason */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Advance Reason <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="advanceReason"
                  value={formData.advanceReason}
                  onChange={handleInputChange}
                  placeholder="Enter reason for advance..."
                  className={`h-11 text-base rounded-xl border-2 transition-all ${
                    errors.advanceReason
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.advanceReason && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.advanceReason}
                  </p>
                )}
              </div>

              {/* Row 5: Detailed Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about your advance request..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 text-base resize-none transition-all ${
                    errors.detailedDescription
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.detailedDescription && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.detailedDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button
                type="reset"
                variant="outline"
                className="flex-1 h-12 text-base font-semibold rounded-xl border-2"
                onClick={() => {
                  setFormData({
                    advanceDate: new Date().toISOString().split('T')[0],
                    advanceCategory: '',
                    currency: 'ZMW',
                    amount: '',
                    promisedRetirementDate: '',
                    advanceReason: '',
                    detailedDescription: '',
                  });
                  setErrors({});
                }}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 text-base font-semibold rounded-xl gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
