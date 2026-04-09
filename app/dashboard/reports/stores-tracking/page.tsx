"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface StoresTrackingRecord {
  Document_No: string
  Document_Type: string
  Currency_Code: string
  Originator: string
  Date_Created: string
  Status_RP?: string
}

interface StoreRequestDetails extends StoresTrackingRecord {
  Amount?: number
  Reason?: string
  Approver_ID?: string
  Sent_By?: string
  Delegated_By?: string
  Date_Sent?: string
  Dimension_1_Code?: string
  Dimension_2_Code?: string
}

export default function StoresTrackingPage() {
  const [records, setRecords] = useState<StoresTrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState<StoreRequestDetails | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        const res = await fetch("/api/stores-tracking/tracking");
        const data = await res.json();
        setRecords(data);
      } catch {
        toast({ title: "Error fetching records", variant: "destructive" });
      }
      setLoading(false);
    }
    fetchRecords();
  }, []);

  async function handleViewDetails(document_no: string) {
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/stores-tracking?document_no=${document_no}`);
      const data = await res.json();
      setRequestDetails(data);
    } catch {
      toast({ title: "Error fetching request details", variant: "destructive" });
      setRequestDetails(null);
    }
    setDetailsLoading(false);
  }

  function approveRequest(document_no: string) {
    toast({ title: `Approved request ${document_no}` });
    setDetailsOpen(false);
  }

  const filteredRecords = records.filter(record => {
    const text = `${record.Document_No} ${record.Document_Type} ${record.Currency_Code} ${record.Originator} ${record.Date_Created}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Stores Tracking</CardTitle>
          <CardDescription>Track and approve store requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <input
              type="text"
              className="border rounded-xl px-3 py-2 w-full max-w-xs"
              placeholder="Search stores..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document No</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Currency Code</TableHead>
                  <TableHead>Originator</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record, idx) => (
                  <TableRow
                    key={record.Document_No + '-' + idx}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleViewDetails(record.Document_No)}
                  >
                    <TableCell>{record.Document_No}</TableCell>
                    <TableCell>{record.Document_Type}</TableCell>
                    <TableCell>{record.Currency_Code}</TableCell>
                    <TableCell>{record.Originator}</TableCell>
                    <TableCell>{record.Date_Created}</TableCell>
                    <TableCell>
                      <Badge variant={record.Status_RP === 'Approved' ? 'outline' : record.Status_RP === 'Pending' ? 'secondary' : 'default'}>
                        {record.Status_RP || '-'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Store Request Details</DialogTitle>
            <DialogDescription>
              {detailsLoading ? "Loading details..." : null}
            </DialogDescription>
          </DialogHeader>
          {!detailsLoading && requestDetails ? (
            <div className="space-y-4">
              <table className="min-w-full border rounded-lg overflow-hidden text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800 w-1/3">Document No</td>
                    <td className="px-4 py-2">{requestDetails.Document_No}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Document Type</td>
                    <td className="px-4 py-2">{requestDetails.Document_Type}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Status</td>
                    <td className="px-4 py-2">
                      <Badge variant={requestDetails.Status_RP === 'Approved' ? 'outline' : requestDetails.Status_RP === 'Pending' ? 'secondary' : 'default'}>{requestDetails.Status_RP || '-'}</Badge>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Currency Code</td>
                    <td className="px-4 py-2">{requestDetails.Currency_Code}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Amount</td>
                    <td className="px-4 py-2">{requestDetails.Amount ? Number(requestDetails.Amount).toFixed(2) : '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Reason</td>
                    <td className="px-4 py-2">{requestDetails.Reason ?? '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Originator</td>
                    <td className="px-4 py-2">{requestDetails.Originator}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Approver ID</td>
                    <td className="px-4 py-2">{requestDetails.Approver_ID ?? '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Sent By</td>
                    <td className="px-4 py-2">{requestDetails.Sent_By ?? '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Delegated By</td>
                    <td className="px-4 py-2">{requestDetails.Delegated_By ?? '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Date Created</td>
                    <td className="px-4 py-2">{requestDetails.Date_Created}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Date Sent</td>
                    <td className="px-4 py-2">{requestDetails.Date_Sent ?? '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Dimension 1 Code</td>
                    <td className="px-4 py-2">{requestDetails.Dimension_1_Code ?? '-'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-800">Dimension 2 Code</td>
                    <td className="px-4 py-2">{requestDetails.Dimension_2_Code ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end gap-2 mt-4">
                <Button id="approveButton" className="btn-approve" onClick={() => approveRequest(requestDetails.Document_No)}>
                  Approve Store
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
