'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Landmark,
  DollarSign,
  Calendar,
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
  loanType: string;
}

const LOAN_TYPES = [
  { value: 'Personal', label: 'Personal Loan' },
  { value: 'Car', label: 'Car Loan' },
  { value: 'Housing', label: 'Housing Loan' },
  { value: 'Education', label: 'Education Loan' },
  { value: 'Emergency', label: 'Emergency Loan' },
  { value: 'Other', label: 'Other' },
];

const CURRENCIES = [
  { value: 'ZMW', label: 'ZMW - Zambian Kwacha' },
  { value: 'USD', label: 'USD - US Dollar' },
];

export default function LoanRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loggedInEmployeeNumber, setLoggedInEmployeeNumber] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [loanNumber, setLoanNumber] = useState('');

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    currencyCode: 'ZMW',
    reason: '',
    amountRequired: '',
    noOfInstallments: '12',
    loanType: '',
  });

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.loanType) newErrors.loanType = 'Loan type is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
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
    if (!formData.currencyCode) newErrors.currencyCode = 'Currency is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix all errors before submitting', variant: 'destructive' });
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
        loan_type: formData.loanType,
      };

      const response = await fetch('/api/loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit loan application');

      const num = data.loan_number;
      setLoanNumber(num);
      setSubmitted(true);
      toast({ title: 'Success', description: `Loan application submitted! Loan #${num}` });

      setTimeout(() => {
        setFormData({ date: new Date().toISOString().split('T')[0], currencyCode: 'ZMW', reason: '', amountRequired: '', noOfInstallments: '12', loanType: '' });
        setSubmitted(false);
        setLoanNumber('');
        setErrors({});
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast({ title: 'Error', description: error.message || 'Failed to submit loan application', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="pt-4">
          <h1 className="text-4xl font-bold text-gray-900">Loan Application</h1>
          <p className="text-gray-600 mt-2 text-lg">Submit a loan application request</p>
        </div>

        <Card className="p-8 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${submitted ? 'bg-green-50' : 'bg-blue-50'}`}>
              {submitted ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Landmark className="w-5 h-5 text-blue-600" />}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {submitted ? 'Loan Application Submitted' : 'Loan Details'}
            </h2>
          </div>

          {submitted ? (
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Loan application submitted successfully!
              </p>
              <p className="text-green-700 text-sm mt-2">Loan Number: <span className="font-bold">{loanNumber}</span></p>
              <p className="text-green-700 text-sm mt-1">The form will reset shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-gray-700">
                  Employee: <span className="text-blue-600 font-bold">{loggedInEmployeeNumber || 'Loading...'}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Request Date <span className="text-red-500">*</span></label>
                  <Input type="date" name="date" value={formData.date} onChange={handleInputChange}
                    className="h-11 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Loan Type <span className="text-red-500">*</span></label>
                  <select name="loanType" value={formData.loanType} onChange={handleInputChange}
                    className={`w-full h-11 px-4 text-base rounded-xl border-2 transition-all ${errors.loanType ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`}>
                    <option value="">Select loan type...</option>
                    {LOAN_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                  {errors.loanType && <p className="text-red-600 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.loanType}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Currency <span className="text-red-500">*</span></label>
                  <select name="currencyCode" value={formData.currencyCode} onChange={handleInputChange}
                    className={`w-full h-11 px-4 text-base rounded-xl border-2 transition-all ${errors.currencyCode ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`}>
                    {CURRENCIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Amount Required <span className="text-red-500">*</span></label>
                  <Input type="number" step="0.01" name="amountRequired" value={formData.amountRequired} onChange={handleInputChange}
                    placeholder="0.00"
                    className={`h-11 text-base rounded-xl border-2 transition-all ${errors.amountRequired ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`} />
                  {errors.amountRequired && <p className="text-red-600 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.amountRequired}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Installments <span className="text-red-500">*</span></label>
                <Input type="number" name="noOfInstallments" value={formData.noOfInstallments} onChange={handleInputChange}
                  placeholder="12" min="1"
                  className={`h-11 text-base rounded-xl border-2 transition-all ${errors.noOfInstallments ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`} />
                {errors.noOfInstallments && <p className="text-red-600 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.noOfInstallments}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Reason <span className="text-red-500">*</span></label>
                <textarea name="reason" value={formData.reason} onChange={handleInputChange}
                  placeholder="Explain the reason for your loan request..." rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 text-base resize-none transition-all ${errors.reason ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`} />
                {errors.reason && <p className="text-red-600 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.reason}</p>}
              </div>

              <Button type="submit" disabled={loading}
                className="w-full h-12 text-base font-semibold rounded-xl gap-2 bg-blue-600 hover:bg-blue-700">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Submitting...</>) : ('Submit Loan Application')}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
