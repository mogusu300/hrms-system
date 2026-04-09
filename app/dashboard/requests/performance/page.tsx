'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Target,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface FormData {
  startDate: string;
  endDate: string;
}

interface LineItem {
  id: string;
  spaCode: string;
  sfaNo: string;
  weight: string;
  smartObjective: string;
  expectedPerformanceStd: string;
}

interface StepState {
  headerSubmitted: boolean;
  documentNumber: string;
}

export default function PerformanceManagementPage() {
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
    startDate: '',
    endDate: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [submittingItems, setSubmittingItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [lineCounter, setLineCounter] = useState(1);
  const [newLine, setNewLine] = useState({
    spaCode: '',
    sfaNo: '',
    weight: '',
    smartObjective: '',
    expectedPerformanceStd: '',
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

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        start_date: formData.startDate,
        end_date: formData.endDate,
      };

      const response = await fetch('/api/performance/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create performance header');
      }

      const documentNumber = data.performance_number || data.document_number;

      setStepState({
        headerSubmitted: true,
        documentNumber: documentNumber,
      });

      toast({
        title: 'Success',
        description: `Performance review created! #${documentNumber}`,
      });
    } catch (error: any) {
      console.error('Error submitting header:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create performance review',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    if (
      !newLine.spaCode.trim() ||
      !newLine.sfaNo.trim() ||
      !newLine.weight.trim() ||
      !newLine.smartObjective.trim() ||
      !newLine.expectedPerformanceStd.trim()
    ) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
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

    setLineCounter((prev) => prev + 1);
    setNewLine({ spaCode: '', sfaNo: '', weight: '', smartObjective: '', expectedPerformanceStd: '' });
    setShowAddForm(false);

    toast({
      title: 'Objective Added',
      description: `Objective has been added to the review`,
    });
  };

  const removeLineItem = (lineId: string) => {
    setLineItems(lineItems.filter((item) => item.id !== lineId));
  };

  const submitLine = async (item: LineItem, index: number) => {
    setSubmittingItems((prev) => new Set([...prev, item.id]));

    try {
      const payload = {
        performance_no: stepState.documentNumber,
        spa_code: item.spaCode,
        sfa_no: item.sfaNo,
        weight: item.weight,
        smart_objective: item.smartObjective,
        expected_performance_std: item.expectedPerformanceStd,
        line_number: (index + 1) * 10000,
      };

      const response = await fetch('/api/performance/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit objective');
      }

      removeLineItem(item.id);
      toast({
        title: 'Success',
        description: `Objective submitted successfully`,
      });
    } catch (error: any) {
      console.error('Error submitting line:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit objective',
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
            <h1 className="text-4xl font-bold text-gray-900">Performance Management</h1>
            <p className="text-gray-600 mt-2 text-lg">Create a new performance review</p>
          </div>

          {/* Header Form */}
          <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Create Review Period</h2>
            </div>

            <form onSubmit={handleSubmitHeader} className="space-y-6">
              {/* Employee Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-gray-700">
                  Created By: <span className="text-blue-600 font-bold">{loggedInEmployeeNumber || 'Loading...'}</span>
                </p>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`h-11 text-base rounded-xl border-2 transition-all ${
                      errors.startDate
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`h-11 text-base rounded-xl border-2 transition-all ${
                      errors.endDate
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.endDate}
                    </p>
                  )}
                </div>
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

  // Step 2: Add Objectives
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-4xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-2 text-lg">Review #{stepState.documentNumber}</p>
        </div>

        {/* Header Info */}
        <Card className="p-6 border-2 border-green-200 rounded-2xl bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-800">Header Created</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-green-700 font-semibold">Performance No</p>
              <p className="text-green-900">{stepState.documentNumber}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Created By</p>
              <p className="text-green-900">{loggedInEmployeeNumber}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Start Date</p>
              <p className="text-green-900">{formData.startDate}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">End Date</p>
              <p className="text-green-900">{formData.endDate}</p>
            </div>
          </div>
        </Card>

        {/* Add Objectives Section */}
        <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Step 2: Add Objectives</h2>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              Add Objective
            </Button>
          </div>

          {/* Objectives Table */}
          {lineItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SPA Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SFA No</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Weight</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SMART Objective</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Expected Std</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{item.spaCode}</td>
                      <td className="py-3 px-4">{item.sfaNo}</td>
                      <td className="py-3 px-4 text-center">{item.weight}</td>
                      <td className="py-3 px-4 max-w-xs truncate" title={item.smartObjective}>
                        {item.smartObjective}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate" title={item.expectedPerformanceStd}>
                        {item.expectedPerformanceStd}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            onClick={() => submitLine(item, index)}
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
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No objectives added yet. Click &quot;Add Objective&quot; to get started.</p>
            </div>
          )}
        </Card>

        {/* Add Objective Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white p-6 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add Performance Objective</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SPA Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={newLine.spaCode}
                      onChange={(e) => setNewLine({ ...newLine, spaCode: e.target.value })}
                      placeholder="SPA Code"
                      className="h-10 rounded-xl border-2 border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SFA No <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={newLine.sfaNo}
                      onChange={(e) => setNewLine({ ...newLine, sfaNo: e.target.value })}
                      placeholder="SFA Number"
                      className="h-10 rounded-xl border-2 border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Weight <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={newLine.weight}
                      onChange={(e) => setNewLine({ ...newLine, weight: e.target.value })}
                      placeholder="e.g. 20%"
                      className="h-10 rounded-xl border-2 border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SMART Objective <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newLine.smartObjective}
                    onChange={(e) => setNewLine({ ...newLine, smartObjective: e.target.value })}
                    placeholder="Describe your SMART objective..."
                    rows={3}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:outline-none focus:ring-0 text-sm resize-none border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Performance Standard <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newLine.expectedPerformanceStd}
                    onChange={(e) => setNewLine({ ...newLine, expectedPerformanceStd: e.target.value })}
                    placeholder="Describe the expected performance standard..."
                    rows={3}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:outline-none focus:ring-0 text-sm resize-none border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white p-6 border-t-2 border-gray-200 flex gap-3">
                <Button
                  onClick={addLineItem}
                  className="flex-1 h-10 rounded-xl bg-orange-600 hover:bg-orange-700"
                >
                  Add Objective
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewLine({ spaCode: '', sfaNo: '', weight: '', smartObjective: '', expectedPerformanceStd: '' });
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
