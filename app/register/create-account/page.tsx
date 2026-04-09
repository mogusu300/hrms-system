'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft, Building2, Phone, FileText } from 'lucide-react';

export default function CreateAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email_address: '',
    nrc: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data from sessionStorage
  useEffect(() => {
    const emp = sessionStorage.getItem('employee_number') || '';
    const phone = sessionStorage.getItem('phone_number') || '';
    
    setEmployeeNumber(emp);
    setPhoneNumber(phone);

    if (!emp || !phone) {
      toast({
        title: 'Error',
        description: 'Missing registration data. Please start over.',
        variant: 'destructive',
      });
      setTimeout(() => {
        router.push('/register');
      }, 2000);
    }
    
    setMounted(true);
  }, [router, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.email_address.trim()) {
      newErrors.email_address = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      newErrors.email_address = 'Please enter a valid email address';
    }
    if (!formData.nrc.trim()) {
      newErrors.nrc = 'NRC is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNrcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    
    // Remove all non-alphanumeric characters
    value = value.replace(/[^A-Z0-9]/g, '');
    
    // Format as XXXXXX/XX/X
    if (value.length <= 6) {
      value = value;
    } else if (value.length <= 8) {
      value = value.slice(0, 6) + '/' + value.slice(6);
    } else {
      value = value.slice(0, 6) + '/' + value.slice(6, 8) + '/' + value.slice(8, 9);
    }
    
    setFormData((prev) => ({
      ...prev,
      nrc: value,
    }));
    if (errors.nrc) {
      setErrors((prev) => ({
        ...prev,
        nrc: '',
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix all errors before continuing',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: '1', // Hidden field - always send 1
          full_name: formData.full_name,
          email_address: formData.email_address,
          phone_number: phoneNumber,
          nrc: formData.nrc,
          password: formData.password,
          employee_number: employeeNumber,
          registered_from: '2023', // Hidden field - always send 2023
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      toast({
        title: 'Success',
        description: 'Account registered successfully! Redirecting...',
        variant: 'default',
      });

      // Clear sessionStorage
      sessionStorage.removeItem('employee_number');
      sessionStorage.removeItem('phone_number');
      sessionStorage.removeItem('otp_result');

      // Redirect to success page with user details
      const successUrl = `/account-created?name=${encodeURIComponent(formData.full_name)}&email=${encodeURIComponent(formData.email_address)}`;
      setTimeout(() => {
        router.push(successUrl);
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/register');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/diverse-team-of-professionals-collaborating-in-mod.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />
      </div>

      {/* Glassmorphic card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30 dark:border-white/20">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white text-balance">Register Account</h1>
              <p className="text-white/80 dark:text-white/70 mt-2 text-balance">
                Step 3: Complete Your Registration
              </p>
            </div>
          </div>

          {/* Registration form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Employee Number (Read-only) */}
            <div className="space-y-2">
              <label htmlFor="employee_number" className="text-white font-medium text-sm block">
                Employee Number
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="employee_number"
                  type="text"
                  value={employeeNumber}
                  disabled
                  className="pl-10 h-12 bg-white/5 border-white/20 text-white cursor-not-allowed rounded-xl"
                />
              </div>
            </div>

            {/* Phone Number (Read-only) */}
            <div className="space-y-2">
              <label htmlFor="phone_number" className="text-white font-medium text-sm block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="phone_number"
                  type="tel"
                  value={`+${phoneNumber}`}
                  disabled
                  className="pl-10 h-12 bg-white/5 border-white/20 text-white cursor-not-allowed rounded-xl"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-white font-medium text-sm block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="full_name"
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/15 rounded-xl"
                  required
                />
              </div>
              {errors.full_name && (
                <p className="text-red-400 text-xs">{errors.full_name}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email_address" className="text-white font-medium text-sm block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="email_address"
                  type="email"
                  name="email_address"
                  placeholder="Enter your email"
                  value={formData.email_address}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/15 rounded-xl"
                  required
                />
              </div>
              {errors.email_address && (
                <p className="text-red-400 text-xs">{errors.email_address}</p>
              )}
            </div>

            {/* NRC */}
            <div className="space-y-2">
              <label htmlFor="nrc" className="text-white font-medium text-sm block">
                NRC
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="nrc"
                  type="text"
                  name="nrc"
                  placeholder="649078/10/1"
                  maxLength="11"
                  value={formData.nrc}
                  onChange={handleNrcChange}
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/15 rounded-xl font-mono"
                  required
                />
              </div>
              {errors.nrc && (
                <p className="text-red-400 text-xs">{errors.nrc}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-white font-medium text-sm block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/15 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-white font-medium text-sm block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/15 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold rounded-xl mt-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register User'}
            </Button>
          </form>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white/80 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to OTP Verification
          </button>

          {/* Login Link */}
          <p className="text-center text-white/60 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:text-white/80 font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}