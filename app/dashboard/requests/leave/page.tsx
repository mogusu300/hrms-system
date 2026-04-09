'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import {
  User,
  FileText,
  Calendar,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
} from 'lucide-react';

type LeaveType = 'Annual' | 'Sick' | 'Compassionate' | 'Maternity' | 'Paternity' | 'Study' | 'Unpaid';

interface FormData {
  employeeNumber: string;
  leaveType: LeaveType;
  reasonForLeave: string;
  fromDate: string;
  toDate: string;
  dateToResume: string;
  residentialAddress: string;
  addressWhilstOnLeave: string;
  phone1: string;
  phone2: string;
}

const LEAVE_TYPES: LeaveType[] = ['Annual', 'Sick', 'Compassionate', 'Maternity', 'Paternity', 'Study', 'Unpaid'];

export default function LeaveRequestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loggedInEmployeeNumber, setLoggedInEmployeeNumber] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    employeeNumber: '',
    leaveType: 'Annual',
    reasonForLeave: '',
    fromDate: '',
    toDate: '',
    dateToResume: '',
    residentialAddress: '',
    addressWhilstOnLeave: '',
    phone1: '',
    phone2: '',
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
        
        // Then fetch employee details
        const encodedEmpNumber = encodeURIComponent(empNumber);
        const detailsResponse = await fetch(`/api/employee-details?manNumber=${encodedEmpNumber}`);
        
        if (detailsResponse.ok) {
          const employeeDetails = await detailsResponse.json();
          
          // Auto-populate form with employee details
          setFormData(prev => ({
            ...prev,
            employeeNumber: empNumber,
            residentialAddress: employeeDetails.address || '',
            phone1: employeeDetails.phone1 || '',
            phone2: employeeDetails.phone2 || '',
            // addressWhilstOnLeave defaults to same as residential address
            addressWhilstOnLeave: employeeDetails.address || '',
          }));
        } else {
          // If employee details fail, at least set the employee number
          setFormData(prev => ({
            ...prev,
            employeeNumber: empNumber,
          }));
        }
      } catch (error) {
        console.error('Error fetching session or employee details:', error);
        // Set a minimal form state if fetch fails
        setFormData(prev => ({
          ...prev,
          employeeNumber: loggedInEmployeeNumber || '',
        }));
      }
    };
    
    fetchSessionAndEmployeeDetails();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Employee number is auto-filled, so no need to validate it
    // Just ensure it's not empty
    if (!formData.employeeNumber.trim()) {
      newErrors.employeeNumber = 'Employee number is required';
    }

    if (!formData.reasonForLeave.trim()) {
      newErrors.reasonForLeave = 'Reason for leave is required';
    }

    if (!formData.fromDate) {
      newErrors.fromDate = 'Start date is required';
    }

    if (!formData.toDate) {
      newErrors.toDate = 'End date is required';
    } else if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      newErrors.toDate = 'End date must be after start date';
    }

    if (!formData.dateToResume) {
      newErrors.dateToResume = 'Return to work date is required';
    } else if (new Date(formData.dateToResume) <= new Date(formData.toDate)) {
      newErrors.dateToResume = 'Return date must be after end date';
    }

    if (!formData.residentialAddress.trim()) {
      newErrors.residentialAddress = 'Residential address is required';
    }

    if (!formData.addressWhilstOnLeave.trim()) {
      newErrors.addressWhilstOnLeave = 'Address whilst on leave is required';
    }

    if (!formData.phone1.trim()) {
      newErrors.phone1 = 'Primary phone number is required';
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

  const calculateDays = (): number => {
    if (formData.fromDate && formData.toDate) {
      const from = new Date(formData.fromDate);
      const to = new Date(formData.toDate);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
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
      const daysTaken = calculateDays();

      const payload = {
        man_number: formData.employeeNumber,
        reason_for_leave: formData.reasonForLeave,
        leave_date: new Date().toISOString().split('T')[0],
        residential_address: formData.residentialAddress,
        address_whilst_on_leave: formData.addressWhilstOnLeave,
        phone1: formData.phone1,
        phone2: formData.phone2,
        leave_type: formData.leaveType,
        from_date: formData.fromDate,
        to_date: formData.toDate,
        date_to_resume: formData.dateToResume,
        days_taken: daysTaken,
        days_commuted: 0,
      };

      const response = await fetch('/api/leave-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit leave application');
      }

      toast({
        title: 'Success',
        description: 'Leave application submitted successfully!',
      });

      // Reset form but keep employee number
      setFormData({
        employeeNumber: loggedInEmployeeNumber,
        leaveType: 'Annual',
        reasonForLeave: '',
        fromDate: '',
        toDate: '',
        dateToResume: '',
        residentialAddress: '',
        addressWhilstOnLeave: '',
        phone1: '',
        phone2: '',
      });
    } catch (error: any) {
      console.error('Error submitting leave application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit leave application',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Leave Request"
          description="Submit a leave of absence request"
          helpText="Fill in the form below to submit a leave request to your supervisor.\n\n• Your employee number is auto-filled from your session\n• Select the type of leave (Annual, Sick, Compassionate, etc.)\n• Choose your start date, end date, and return date\n• Provide contact details for the period you'll be away\n• Your request will be routed to your supervisor for approval\n\nYou can track the status of your request in the Tracking section."
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Employee Information Section */}
          <Card className="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Employee Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Employee Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.employeeNumber || loggedInEmployeeNumber}
                    disabled
                    placeholder="Loading..."
                    className="h-11 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 font-semibold cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-2">Auto-filled from your account</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Leave Details Section */}
          <Card className="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Leave Details</h2>
            </div>

            <div className="space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-0 text-base transition-all"
                >
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason for Leave */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Reason for Leave <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reasonForLeave"
                  value={formData.reasonForLeave}
                  onChange={handleInputChange}
                  placeholder="Explain the reason for your leave request..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 text-base resize-none transition-all ${
                    errors.reasonForLeave
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.reasonForLeave && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.reasonForLeave}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Dates Section */}
          <Card className="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Leave Dates</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* From Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  className={`h-11 text-base rounded-xl border-2 transition-all ${
                    errors.fromDate
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.fromDate && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fromDate}
                  </p>
                )}
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  End Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  className={`h-11 text-base rounded-xl border-2 transition-all ${
                    errors.toDate
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.toDate && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.toDate}
                  </p>
                )}
              </div>

              {/* Date to Resume */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date to Resume Work <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="dateToResume"
                  value={formData.dateToResume}
                  onChange={handleInputChange}
                  className={`h-11 text-base rounded-xl border-2 transition-all ${
                    errors.dateToResume
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.dateToResume && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.dateToResume}
                  </p>
                )}
              </div>

              {/* Days to be Taken */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Days to be Taken
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={calculateDays()}
                    disabled
                    className="h-11 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-2">Automatically calculated</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact & Address Section */}
          <Card className="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Contact & Address Information</h2>
            </div>

            <div className="space-y-6">
              {/* Residential Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Residential Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={handleInputChange}
                  placeholder="Your home address..."
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 text-base resize-none transition-all ${
                    errors.residentialAddress
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.residentialAddress && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.residentialAddress}
                  </p>
                )}
              </div>

              {/* Address Whilst on Leave */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Address Whilst on Leave <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="addressWhilstOnLeave"
                  value={formData.addressWhilstOnLeave}
                  onChange={handleInputChange}
                  placeholder="Address where you'll be during your leave..."
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 text-base resize-none transition-all ${
                    errors.addressWhilstOnLeave
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.addressWhilstOnLeave && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.addressWhilstOnLeave}
                  </p>
                )}
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Primary Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone1"
                    value={formData.phone1}
                    onChange={handleInputChange}
                    placeholder="e.g., +260 97 123 4567"
                    className={`h-11 text-base rounded-xl border-2 transition-all ${
                      errors.phone1
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.phone1 && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Secondary Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleInputChange}
                    placeholder="e.g., +260 97 987 6543"
                    className="h-11 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 pb-8">
            <Button
              type="reset"
              variant="outline"
              className="flex-1 h-12 text-base font-semibold rounded-xl border-2"
              onClick={() => {
                setFormData({
                  employeeNumber: loggedInEmployeeNumber,
                  leaveType: 'Annual',
                  reasonForLeave: '',
                  fromDate: '',
                  toDate: '',
                  dateToResume: '',
                  residentialAddress: '',
                  addressWhilstOnLeave: '',
                  phone1: '',
                  phone2: '',
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
      </div>
    </div>
  );
}
