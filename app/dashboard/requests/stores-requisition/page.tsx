'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface FormData {
  reason: string;
}

interface SelectedItem {
  no: string;
  description: string;
  unitOfMeasure: string;
  unitCost: number;
  inventory: number;
  quantity: number;
}

interface StepState {
  headerSubmitted: boolean;
  documentNumber: string;
}

interface BusinessCentralItem {
  Number: string;
  DisplayName: string;
  BaseUnitOfMeasure: string;
  UnitPrice?: number;
}

interface AvailableItem {
  no: string;
  description: string;
  unitOfMeasure: string;
  unitCost: number;
  inventory: number;
}

export default function StoresRequisitionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loggedInEmployeeNumber, setLoggedInEmployeeNumber] = useState<string>('');
  const [stepState, setStepState] = useState<StepState>({
    headerSubmitted: false,
    documentNumber: '',
  });

  const [formData, setFormData] = useState<FormData>({
    reason: '',
  });

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [submittingItems, setSubmittingItems] = useState<Set<string>>(new Set());
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);

  // Get employee number from session and fetch items on mount
  useEffect(() => {
    const fetchSessionAndItems = async () => {
      try {
        const sessionResponse = await fetch('/api/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const empNumber = sessionData.session?.employee_number || sessionData.employeeNumber;
          if (empNumber) {
            setLoggedInEmployeeNumber(empNumber);
            
            // Fetch employee details (optional - just for future use)
            const encodedEmpNumber = encodeURIComponent(empNumber);
            await fetch(`/api/employee-details?manNumber=${encodedEmpNumber}`).catch(err => {
              console.log('Employee details fetch skipped, not required for stores requisition');
            });
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }

      // Fetch items from Business Central
      fetchItems();
    };

    fetchSessionAndItems();
  }, []);

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const response = await fetch('/api/items');

      if (response.ok) {
        const data = await response.json();
        const items = data.value || [];

        // Transform BC items to our format with fallbacks
        const transformedItems = items.map((item: BusinessCentralItem) => ({
          no: item.Number || '',
          description: item.DisplayName || 'Unnamed Item',
          unitOfMeasure: item.BaseUnitOfMeasure || 'PCS',
          unitCost: item.UnitPrice || 0,
          inventory: 0, // BC doesn't provide inventory in this endpoint
        })).filter((item: AvailableItem) => item.no); // Filter out items without a number

        setAvailableItems(transformedItems);
        console.log(`Loaded ${transformedItems.length} items from Business Central`);
      } else {
        console.error('Failed to fetch items:', response.statusText);
        toast({
          title: 'Warning',
          description: 'Could not load items from server.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load items',
        variant: 'destructive',
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const validateHeader = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        stores_type: 'Requisition', // Fixed value for stores requisition
        reason: formData.reason,
      };

      const response = await fetch('/api/stores-requisition/header', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create stores requisition header');
      }

      const documentNumber = data.document_number || data.documentNumber;

      setStepState({
        headerSubmitted: true,
        documentNumber: documentNumber,
      });

      toast({
        title: 'Success',
        description: `Stores requisition created! Document #${documentNumber}`,
      });
    } catch (error: any) {
      console.error('Error submitting header:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create stores requisition',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (item: AvailableItem) => {
    const exists = selectedItems.find(i => i.no === item.no);
    if (exists) {
      toast({
        title: 'Duplicate Item',
        description: 'This item has already been added',
        variant: 'destructive',
      });
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        no: item.no,
        description: item.description,
        unitOfMeasure: item.unitOfMeasure,
        unitCost: item.unitCost,
        inventory: item.inventory,
        quantity: 1,
      },
    ]);

    setShowItemModal(false);
    setItemSearch('');
    toast({
      title: 'Item Added',
      description: `${item.description} has been added to the requisition`,
    });
  };

  const updateItemQuantity = (itemNo: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item.no === itemNo ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (itemNo: string) => {
    setSelectedItems(selectedItems.filter((item) => item.no !== itemNo));
  };

  const submitLine = async (item: SelectedItem) => {
    setSubmittingItems((prev) => new Set([...prev, item.no]));

    try {
      const payload = {
        man_number: loggedInEmployeeNumber,
        document_number: stepState.documentNumber,
        account_type: 0, // Stores requisition account type (different from return)
        account_number: item.no,
        description: item.description,
        quantity: item.quantity,
        unit_of_measure: item.unitOfMeasure,
        unit_cost: item.unitCost,
      };

      const response = await fetch('/api/stores-requisition/line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit line');
      }

      removeItem(item.no);
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
        newSet.delete(item.no);
        return newSet;
      });
    }
  };

  const filteredItems = availableItems.filter((item) =>
    (item.description && item.description.toLowerCase().includes(itemSearch.toLowerCase())) ||
    (item.no && item.no.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  if (!stepState.headerSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="pt-4">
            <h1 className="text-4xl font-bold text-gray-900">Stores Requisition</h1>
            <p className="text-gray-600 mt-2 text-lg">Create a new stores requisition request</p>
          </div>

          {/* Header Form */}
          <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Create Requisition Header</h2>
            </div>

            <form onSubmit={handleSubmitHeader} className="space-y-6">
              {/* Employee Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-gray-700">
                  Created By: <span className="text-blue-600 font-bold">{loggedInEmployeeNumber || 'Loading...'}</span>
                </p>
              </div>

              {/* Type Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-gray-700">
                  Type: <span className="text-blue-600 font-bold">Requisition</span>
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange(e as any)}
                  placeholder="Enter reason for requisition..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 text-base transition-all resize-none ${
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-4xl font-bold text-gray-900">Stores Requisition</h1>
          <p className="text-gray-600 mt-2 text-lg">Document #{stepState.documentNumber}</p>
        </div>

        {/* Header Info */}
        <Card className="p-6 border-2 border-green-200 rounded-2xl bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-800">Header Created</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-green-700 font-semibold">Document Number</p>
              <p className="text-green-900">{stepState.documentNumber}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Created By</p>
              <p className="text-green-900">{loggedInEmployeeNumber}</p>
            </div>
            <div>
              <p className="text-green-700 font-semibold">Type</p>
              <p className="text-green-900">Requisition</p>
            </div>
          </div>
        </Card>

        {/* Add Items Section */}
        <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Step 2: Add Items</h2>
            </div>
            <Button
              onClick={() => setShowItemModal(true)}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          {/* Items Table */}
          {selectedItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">UOM</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Cost</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.no} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{item.no}</td>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4 text-center">{item.unitOfMeasure}</td>
                      <td className="py-3 px-4 text-right">{item.unitCost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(item.no, parseInt(e.target.value) || 1)
                          }
                          className="w-16 h-9 text-center rounded-lg border-2 border-gray-200"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {(item.quantity * item.unitCost).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            onClick={() => submitLine(item)}
                            disabled={submittingItems.has(item.no)}
                            className="h-8 gap-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {submittingItems.has(item.no) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Submit'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.no)}
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
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No items added yet. Click "Add Item" to get started.</p>
            </div>
          )}
        </Card>

        {/* Item Selection Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white p-6 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Select Items</h3>
                <Input
                  type="text"
                  placeholder="Search by item number or description..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="h-10 rounded-xl border-2 border-gray-200"
                />
              </div>

              <div className="p-6 space-y-2">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <button
                      key={item.no}
                      onClick={() => addItem(item)}
                      className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.no}</p>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            UOM: {item.unitOfMeasure} | Cost: {item.unitCost.toFixed(2)} | Stock: {item.inventory}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No items found</p>
                )}
              </div>

              <div className="sticky bottom-0 bg-white p-6 border-t-2 border-gray-200">
                <Button
                  onClick={() => setShowItemModal(false)}
                  variant="outline"
                  className="w-full h-10 rounded-xl"
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
