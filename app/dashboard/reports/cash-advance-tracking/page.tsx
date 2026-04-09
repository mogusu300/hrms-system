"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface CashAdvanceRecord {
  advance_number: string
  employee_number: string
  status: string
  amount: string
  reason: string
}

export default function CashAdvanceTrackingPage() {
  const [records, setRecords] = useState<CashAdvanceRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch("/api/cash_advance_api.php?action=get_cash_advances")
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(() => toast({ title: "Error fetching records", variant: "destructive" }))
      .finally(() => setLoading(false))
  }, [])

  // Approval logic can be added if needed

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Cash Advance Tracking</CardTitle>
          <CardDescription>Track cash advance requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Advance #</TableHead>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(record => (
                  <TableRow key={record.advance_number}>
                    <TableCell>{record.advance_number}</TableCell>
                    <TableCell>{record.employee_number}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.amount}</TableCell>
                    <TableCell>{record.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
