'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Plane,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface FormData {
  date: string;
  currencyCode: string;
  reason: string;
  departureDate: string;
  tripDuration: string;
}

interface LineItem {
  id: string;
  accountNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
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

export default function ImprestRequestPage() {
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
    date: new Date().toISOString().split('T')[0],
    currencyCode: 'ZMW',
    reason: '',
    departureDate: '',
    tripDuration: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [submittingItems, setSubmittingItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLine, setNewLine] = useState({
    accountNumber: '',
    description: '',
    quantity: '1',
    unitCost: '',
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

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required';
    }
    if (!formData.tripDuration) {
      newErrors.tripDuration = 'Trip duration is required';
    } else if (parseInt(formData.tripDuration) < 1) {
      newErrors.tripDuration = 'Trip duration must be at least 1 day';
    }
    if (!formData.currencyCode) {
      newErrors.currencyCode = 'Currency is required';
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
        date: formData.date,
        currency_code: formData.currencyCode,
        reason: formData.reason,
        departure_date: formData.departureDate,
        trip_duration: parseInt(formData.tripDuration),
      };

      const response = await fetch('/api/imprest/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create imprest header');
      }

      const documentNumber = data.imprest_number || data.document_number;

      setStepState({
        headerSubmitted: true,
        documentNumber: documentNumber,
      });

      toast({
        title: 'Success',
        description: `Imprest created! Document #${documentNumber}`,
      });
    } catch (error: any) {
      console.error('Error submitting header:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create imprest',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    if (!newLine.accountNumber.trim() || !newLine.description.trim() || !newLine.unitCost) {
      toast({
        title: 'Validation Error',
        description: 'Account Number, Description, and Unit Cost are required',
        variant: 'destructive',
      });
      return;
    }

    if (parseFloat(newLine.unitCost) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Unit cost must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    const lineId = `line-${Date.now()}`;
    setLineItems([
      ...lineItems,
      {
        id: lineId,
        accountNumber: newLine.accountNumber,
        description: newLine.description,
        quantity: parseFloat(newLine.quantity) || 1,
        unitCost: parseFloat(newLine.unitCost),
      },
    ]);

    setNewLine({ accountNumber: '', description: '', quantity: '1', unitCost: '' });
    setShowAddForm(false);

    toast({
      title: 'Line Added',
      description: `${newLine.description} has been added`,
    });
  };

  const removeLineItem = (lineId: string) => {
    setLineItems(lineItems.filter((item) => item.id !== lineId));
  };

  const submitLine = async (item: LineItem) => {
    setSubmittingItems((prev) => new Set([...prev, item.id]));

    try {
      const payload = {
        man_number: loggedInEmployeeNumber,
        imprest_number: stepState.documentNumber,
        account_number: item.accountNumber,
        description: item.description,
        quantity: item.quantity,
        unit_cost: item.unitCost,
      };

      const response = await fetch('/api/imprest/line', {
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
        description: `${item.description} submitted successfully`,
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
            <h1 className="text-4xl font-bold text-gray-900">Imprest Request</h1>
            <p className="text-gray-600 mt-2 text-lg">Create a new imprest/travel advance request</p>
          </div>

          {/* Header Form */}
          <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Create Imprest Header</h2>
            </div>

            <form onSubmit={handleSubmitHeader} className="space-y-6">
              {/* Employee Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-gray-700">
                  Created By: <span className="text-blue-600 font-bold">{loggedInEmployeeNumber || 'Loading...'}</span>
                </p>
              </div>

              {/* Date & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currencyCode"
                    value={formData.currencyCode}
                    onChange={handleInputChange}
                    className={`w-full h-11 px-4 border-2 rounded-xl focus:outline-none focus:ring-0 text-base transition-all ${
                      errors.currencyCode
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
                  {errors.currencyCode && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.currencyCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Departure Date & Trip Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Departure Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    className={`h-11 text-base rounded-xl border-2 transition-all ${
                      errors.departureDate
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.departureDate && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.departureDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Trip Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="tripDuration"
                    value={formData.tripDuration}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                    min="1"
                    className={`h-11 text-base rounded-xl border-2 transition-all ${
                      errors.tripDuration
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.tripDuration && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.tripDuration}
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
                  placeholder="Reason for imprest/travel advance..."
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
          <h1 className="text-4xl font-bold text-gray-900">Imprest Request</h1>
          <p className="text-gray-600 mt-2 text-lg">Document #{stepState.documentNumber}</p>
        </div>

        {/* Header Info */}
        <Card className="p-6 border-2 border-green-200 rounded-2xl bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-800">Header Created</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-green-700 font-semibold">Document Number</p>
              <p className="text-green-900">{stepState.documentNumber}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Created By</p>
              <p className="text-green-900">{loggedInEmployeeNumber}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Currency</p>
              <p className="text-green-900">{formData.currencyCode}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Trip Duration</p>
              <p className="text-green-900">{formData.tripDuration} day(s)</p>
            </div>
          </div>
        </Card>

        {/* Add Expense Items Section */}
        <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Plane className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Step 2: Add Expense Items</h2>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              Add Item
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
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Cost</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{item.accountNumber}</td>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">{item.unitCost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {(item.quantity * item.unitCost).toFixed(2)}
                      </td>
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
              <Plane className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No expense items added yet. Click &quot;Add Item&quot; to get started.</p>
            </div>
          )}
        </Card>

        {/* Add Line Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <div className="p-6 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add Expense Item</h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newLine.accountNumber}
                    onChange={(e) => setNewLine({ ...newLine, accountNumber: e.target.value })}
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
                    value={newLine.description}
                    onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                    placeholder="Describe the expense"
                    className="h-10 rounded-xl border-2 border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newLine.quantity}
                      onChange={(e) => setNewLine({ ...newLine, quantity: e.target.value })}
                      placeholder="1"
                      className="h-10 rounded-xl border-2 border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Cost <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newLine.unitCost}
                      onChange={(e) => setNewLine({ ...newLine, unitCost: e.target.value })}
                      placeholder="0.00"
                      className="h-10 rounded-xl border-2 border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t-2 border-gray-200 flex gap-3">
                <Button
                  onClick={addLineItem}
                  className="flex-1 h-10 rounded-xl bg-orange-600 hover:bg-orange-700"
                >
                  Add Item
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewLine({ accountNumber: '', description: '', quantity: '1', unitCost: '' });
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
