'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface FormData {
  claimDate: string;
  currency: string;
  claimReason: string;
  detailedDescription: string;
}

interface LineItem {
  id: string;
  accountNo: string;
  claimDescription: string;
  claimAmount: string;
  externalDocNumber: string;
}

interface StepState {
  headerSubmitted: boolean;
  documentNumber: string;
}

const CURRENCIES = [
  { value: 'ZMW', label: 'ZMW' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

export default function CashClaimRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loggedInEmployeeNumber, setLoggedInEmployeeNumber] = useState<string>('');
  const [stepState, setStepState] = useState<StepState>({
    headerSubmitted: false,
    documentNumber: '',
  });

  const [formData, setFormData] = useState<FormData>({
    claimDate: new Date().toISOString().split('T')[0],
    currency: 'ZMW',
    claimReason: '',
    detailedDescription: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [submittingItems, setSubmittingItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLine, setNewLine] = useState<Omit<LineItem, 'id'>>({
    accountNo: '',
    claimDescription: '',
    claimAmount: '',
    externalDocNumber: '',
  });

  // Get employee number from session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionResponse = await fetch('/api/session');
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();
        const empNumber = sessionData.session?.employee_number || sessionData.employeeNumber;
        if (!empNumber) throw new Error('No employee number found in session');
        setLoggedInEmployeeNumber(empNumber);

        // Optional: fetch employee details
        const encodedEmpNumber = encodeURIComponent(empNumber);
        await fetch(`/api/employee-details?manNumber=${encodedEmpNumber}`).catch(() => {
          console.log('Employee details fetch skipped');
        });
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  const validateHeader = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.claimReason.trim()) {
      newErrors.claimReason = 'Claim reason is required';
    }
    if (!formData.detailedDescription.trim()) {
      newErrors.detailedDescription = 'Detailed description is required';
    }
    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitHeader = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateHeader()) {
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
        claim_date: formData.claimDate,
        currency: formData.currency,
        claim_reason: formData.claimReason,
        detailed_description: formData.detailedDescription,
      };

      const response = await fetch('/api/cash-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create cash claim header');
      }

      const documentNumber = data.claim_number || data.document_number;

      setStepState({
        headerSubmitted: true,
        documentNumber: documentNumber,
      });

      toast({
        title: 'Success',
        description: `Cash claim created! Claim #${documentNumber}`,
      });
    } catch (error: any) {
      console.error('Error submitting header:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create cash claim',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    if (!newLine.accountNo.trim() || !newLine.claimDescription.trim() || !newLine.claimAmount) {
      toast({
        title: 'Validation Error',
        description: 'Account No, Description, and Amount are required',
        variant: 'destructive',
      });
      return;
    }

    if (parseFloat(newLine.claimAmount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    const lineId = `line-${Date.now()}`;
    setLineItems([
      ...lineItems,
      {
        id: lineId,
        ...newLine,
      },
    ]);

    setNewLine({ accountNo: '', claimDescription: '', claimAmount: '', externalDocNumber: '' });
    setShowAddForm(false);

    toast({
      title: 'Line Added',
      description: `${newLine.claimDescription} has been added to the claim`,
    });
  };

  const removeLineItem = (lineId: string) => {
    setLineItems(lineItems.filter((item) => item.id !== lineId));
  };

  const submitLine = async (item: LineItem) => {
    setSubmittingItems((prev) => new Set([...prev, item.id]));

    try {
      const payload = {
        claim_number: stepState.documentNumber,
        account_no: item.accountNo,
        claim_description: item.claimDescription,
        claim_amount: parseFloat(item.claimAmount),
        external_doc_number: item.externalDocNumber || '',
      };

      const response = await fetch('/api/cash-claim/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit line');
      }

      removeLineItem(item.id);
      toast({
        title: 'Success',
        description: `${item.claimDescription} submitted successfully`,
      });
    } catch (error: any) {
      console.error('Error submitting line:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit line',
        variant: 'destructive',
      });
    } finally {
      setSubmittingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  // Step 1: Header Form
  if (!stepState.headerSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="pt-4">
            <h1 className="text-4xl font-bold text-gray-900">Cash Claim</h1>
            <p className="text-gray-600 mt-2 text-lg">Create a new cash claim request</p>
          </div>

          {/* Header Form */}
          <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Create Claim Header</h2>
            </div>

            <form onSubmit={handleSubmitHeader} className="space-y-6">
              {/* Employee Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-gray-700">
                  Created By: <span className="text-blue-600 font-bold">{loggedInEmployeeNumber || 'Loading...'}</span>
                </p>
              </div>

              {/* Claim Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Claim Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="claimDate"
                  value={formData.claimDate}
                  onChange={handleInputChange}
                  className="h-11 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500"
                />
              </div>

              {/* Currency */}
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

              {/* Claim Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Claim Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="claimReason"
                  value={formData.claimReason}
                  onChange={handleInputChange}
                  placeholder="Reason for your cash claim..."
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 text-base resize-none transition-all ${
                    errors.claimReason
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.claimReason && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.claimReason}
                  </p>
                )}
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description..."
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
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Add Line Items
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-4xl font-bold text-gray-900">Cash Claim</h1>
          <p className="text-gray-600 mt-2 text-lg">Claim #{stepState.documentNumber}</p>
        </div>

        {/* Header Info */}
        <Card className="p-6 border-2 border-green-200 rounded-2xl bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-800">Header Created</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-green-700 font-semibold">Claim Number</p>
              <p className="text-green-900">{stepState.documentNumber}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Created By</p>
              <p className="text-green-900">{loggedInEmployeeNumber}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Currency</p>
              <p className="text-green-900">{formData.currency}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Date</p>
              <p className="text-green-900">{formData.claimDate}</p>
            </div>
          </div>
        </Card>

        {/* Add Line Items Section */}
        <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Step 2: Add Claim Lines</h2>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              Add Line
            </Button>
          </div>

          {/* Line Items Table */}
          {lineItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Account No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ext Doc #</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{item.accountNo}</td>
                      <td className="py-3 px-4">{item.claimDescription}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {parseFloat(item.claimAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">{item.externalDocNumber || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            onClick={() => submitLine(item)}
                            disabled={submittingItems.has(item.id)}
                            className="h-8 gap-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {submittingItems.has(item.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Submit'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeLineItem(item.id)}
                            className="h-8 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No claim lines added yet. Click &quot;Add Line&quot; to get started.</p>
            </div>
          )}
        </Card>

        {/* Add Line Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <div className="p-6 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add Claim Line</h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account No <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newLine.accountNo}
                    onChange={(e) => setNewLine({ ...newLine, accountNo: e.target.value })}
                    placeholder="Enter account number"
                    className="h-10 rounded-xl border-2 border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newLine.claimDescription}
                    onChange={(e) => setNewLine({ ...newLine, claimDescription: e.target.value })}
                    placeholder="Describe the claim item"
                    className="h-10 rounded-xl border-2 border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newLine.claimAmount}
                    onChange={(e) => setNewLine({ ...newLine, claimAmount: e.target.value })}
                    placeholder="0.00"
                    className="h-10 rounded-xl border-2 border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    External Document No
                  </label>
                  <Input
                    type="text"
                    value={newLine.externalDocNumber}
                    onChange={(e) => setNewLine({ ...newLine, externalDocNumber: e.target.value })}
                    placeholder="Optional reference number"
                    className="h-10 rounded-xl border-2 border-gray-200"
                  />
                </div>
              </div>

              <div className="p-6 border-t-2 border-gray-200 flex gap-3">
                <Button
                  onClick={addLineItem}
                  className="flex-1 h-10 rounded-xl bg-orange-600 hover:bg-orange-700"
                >
                  Add Line
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewLine({ accountNo: '', claimDescription: '', claimAmount: '', externalDocNumber: '' });
                  }}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
