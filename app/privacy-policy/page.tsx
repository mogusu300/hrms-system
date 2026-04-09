"use client"

import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, AlertTriangle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/login">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Privacy & Data Protection Policy</h1>
              <p className="text-xs text-muted-foreground">MWSC ERP Mobile/Web Application</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Introduction */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-5 h-5 text-primary" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-3">
            <p>
              Mulonga Water Supply & Sanitation Company (MWSC) is committed to protecting the privacy
              and security of all personal data processed through the MWSC ERP Mobile/Web Application.
              This policy outlines how we collect, use, store, and protect your information in compliance
              with the Zambia Data Protection Act No. 3 of 2021 and MWSC&apos;s internal data protection policies.
            </p>
            <p>
              By using this application, you acknowledge that you have read and understood this privacy policy.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="w-5 h-5 text-primary" />
              Data We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Employee Information</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Employee number and full name</li>
                <li>Department and designation</li>
                <li>Contact information (phone number, email)</li>
                <li>Employment status and records</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Application Data</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Leave applications and approval records</li>
                <li>Transport requests and tracking data</li>
                <li>Purchase requisitions and stores transactions</li>
                <li>Salary and cash advance requests</li>
                <li>Work orders and job card updates</li>
                <li>Performance management records</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Technical Data</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Session authentication tokens</li>
                <li>Device type and browser information</li>
                <li>Application usage logs for security purposes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Eye className="w-5 h-5 text-primary" />
              How We Use Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Your data is used exclusively for the following purposes:</p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
              <li><strong>Authentication:</strong> To verify your identity and provide secure access to the ERP system</li>
              <li><strong>Business Operations:</strong> To process and track leave applications, purchase requisitions, transport requests, work orders, and other business workflows</li>
              <li><strong>Approval Workflows:</strong> To route requests to appropriate supervisors and managers for approval</li>
              <li><strong>Reporting:</strong> To generate operational reports for management decision-making</li>
              <li><strong>Notifications:</strong> To send you updates about the status of your requests and assigned tasks</li>
              <li><strong>System Improvement:</strong> To improve the performance and usability of the application</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Storage & Security */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="w-5 h-5 text-primary" />
              Data Storage & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-sm">Where your data is stored</h3>
              <p className="text-sm text-muted-foreground">
                All data is stored on MWSC&apos;s internal servers and within the Microsoft Dynamics Business Central
                ERP system. No data is stored on third-party cloud services outside of MWSC&apos;s infrastructure.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Security Measures</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Password-based authentication with encrypted storage</li>
                <li>Session-based access control with automatic timeout (24 hours)</li>
                <li>Role-based access to ensure users only see data relevant to their function</li>
                <li>Secure HTTP-only session cookies that cannot be accessed by client-side scripts</li>
                <li>OTP verification for new account registration</li>
                <li>Active Directory integration for corporate authentication (where configured)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Offline Data</h3>
              <p className="text-sm text-muted-foreground">
                When using the offline feature, minimal data is cached locally on your device to enable
                continued operation during network outages. This cached data is encrypted and automatically
                synced with the server when connectivity is restored. Cached data is cleared when you log out.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCheck className="w-5 h-5 text-primary" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Under the Zambia Data Protection Act, you have the following rights:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
              <li><strong>Right to Access:</strong> You may request a copy of the personal data held about you</li>
              <li><strong>Right to Rectification:</strong> You may request correction of inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> You may request deletion of your data when no longer required for its stated purpose</li>
              <li><strong>Right to Object:</strong> You may object to the processing of your personal data in certain circumstances</li>
              <li><strong>Right to Data Portability:</strong> You may request your data in a structured, machine-readable format</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              To exercise any of these rights, please contact the MWSC IT Department or the Data Protection Officer.
            </p>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Data Sharing & Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              MWSC does not sell, trade, or share your personal data with external third parties except:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
              <li>When required by Zambian law or regulatory authorities</li>
              <li>Within MWSC departments as needed for business operations</li>
              <li>With authorized MWSC IT service providers under strict confidentiality agreements</li>
              <li>When necessary to protect the safety and security of MWSC employees and assets</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="w-5 h-5 text-primary" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              For any questions or concerns about this privacy policy or how your data is handled,
              please contact:
            </p>
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium">MWSC IT Department</p>
              <p className="text-sm text-muted-foreground">Mulonga Water Supply & Sanitation Company</p>
              <p className="text-sm text-muted-foreground">Kafubu, Zambia</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Last updated: April 2026
            </p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pb-8">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
