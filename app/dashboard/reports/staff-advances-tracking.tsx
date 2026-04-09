"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"


interface StaffAdvanceRecord {
  Document_No: string;
  Document_Type: string;
  Approver_ID: string;
  Status_WF: string;
  Pay_to_Code: string;
  Reason: string;
  Originator: string;
  Date_Created: string;
  Sent_By: string;
  Date_Sent: string;
  Amount: number;
  Comment?: string;
}


export default function StaffAdvancesTrackingPage() {
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<StaffAdvanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<StaffAdvanceRecord | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/staff-advances-tracking")
      .then(res => {
        if (!res.ok) throw new Error('API returned ' + res.status);
        return res.json();
      })
      .then(data => setRecords(data))
      .catch((err) => {
        setFetchError(err.message);
        toast({ title: "Error fetching records", description: err.message, variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleViewDetails = async (advance: StaffAdvanceRecord) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsOpen(true);
    try {
      const res = await fetch(`/api/staff-advances-tracking/details?document_no=${encodeURIComponent(advance.Document_No)}&document_type=${encodeURIComponent(advance.Document_Type)}`);
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      setSelectedAdvance(data);
    } catch (err: any) {
      setDetailsError(err.message);
      setSelectedAdvance(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const text = [
      record.Document_Type,
      record.Approver_ID,
      record.Status_WF,
      record.Document_No,
      record.Pay_to_Code,
      record.Reason,
      record.Originator,
      record.Date_Created,
      record.Sent_By,
      record.Date_Sent,
      record.Amount?.toString(),
      record.Comment
    ].join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground" />
            <CardTitle>Staff Advances Tracking</CardTitle>
          </div>
          <CardDescription>Track staff advance requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="search-container" style={{ marginBottom: 15, width: '100%' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search advances..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, height: 32 }}
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : fetchError ? (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              Error fetching staff advances: {fetchError}
              <br />
              <span style={{ fontSize: '0.9em', color: 'gray' }}>
                (Check the API route and backend logs.)
              </span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              No staff advances found.
            </div>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 4 }}>
              <Table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Approver ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Document No</TableHead>
                    <TableHead>Pay to Code</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Originator</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Sent By</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, idx) => (
                    <TableRow
                      key={`${record.Document_No || 'row'}-${record.Document_Type || 'type'}-${idx}`}
                      className="clickable-row"
                      style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#e6f3ff', cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                      onClick={() => handleViewDetails(record)}
                    >
                      <TableCell>{record.Document_Type}</TableCell>
                      <TableCell>{record.Approver_ID}</TableCell>
                      <TableCell>{record.Status_WF}</TableCell>
                      <TableCell>{record.Document_No}</TableCell>
                      <TableCell>{record.Pay_to_Code}</TableCell>
                      <TableCell>{record.Reason}</TableCell>
                      <TableCell>{record.Originator}</TableCell>
                      <TableCell>{record.Date_Created}</TableCell>
                      <TableCell>{record.Sent_By}</TableCell>
                      <TableCell>{record.Date_Sent}</TableCell>
                      <TableCell>{record.Amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx global>{`
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .clickable-row:hover {
          background-color: rgba(0,0,0,0.05) !important;
        }
        .search-input {
          width: 100%;
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          height: 32px;
        }
        .table-container {
          overflow-x: auto;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .table th, .table td {
          padding: 4px 8px;
          text-align: left;
          height: 24px;
          border: 1px solid #e0e0e0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        .table th {
          background-color: #f3f3f3;
          font-weight: 600;
          height: 28px;
        }
      `}</style>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Staff Advance Details</DialogTitle>
            <DialogDescription>
              {detailsLoading ? "Loading details..." : null}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : detailsError ? (
            <div className="py-4 px-4 bg-red-50 text-red-600 rounded">Error: {detailsError}</div>
          ) : selectedAdvance ? (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Document Type</p>
                  <p className="text-sm">{selectedAdvance.Document_Type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Approver ID</p>
                  <p className="text-sm">{selectedAdvance.Approver_ID}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <p className="text-sm">{selectedAdvance.Status_WF}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Document No</p>
                  <p className="text-sm">{selectedAdvance.Document_No}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Pay to Code</p>
                  <p className="text-sm">{selectedAdvance.Pay_to_Code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Originator</p>
                  <p className="text-sm">{selectedAdvance.Originator}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Date Created</p>
                  <p className="text-sm">{selectedAdvance.Date_Created}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Sent By</p>
                  <p className="text-sm">{selectedAdvance.Sent_By || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Date Sent</p>
                  <p className="text-sm">{selectedAdvance.Date_Sent}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Amount</p>
                  <p className="text-sm">{typeof selectedAdvance.Amount === 'number' ? selectedAdvance.Amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : selectedAdvance.Amount}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Reason</p>
                <p className="text-sm">{selectedAdvance.Reason || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Comment</p>
                <p className="text-sm">{selectedAdvance.Comment || '-'}</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No details available</div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t mt-6">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
