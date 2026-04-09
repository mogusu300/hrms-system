"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface TransportRequestApprovalRecord {
  Document_No: string;
  Pay_to_Code: string;
  Pay_to_Name: string;
  Reason: string;
  Status_WF: string;
  Date_Sent: string;
  Sent_By: string;
  Approver_ID?: string;
  Date_Approved?: string;
  Dimension_1_Code?: string;
  Dimension_2_Code?: string;
  Comment?: string;
}

export default function TransportRequestsApprovalPage() {
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<TransportRequestApprovalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequestApprovalRecord | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/transport-requests")
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

  const handleViewDetails = async (request: TransportRequestApprovalRecord) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsOpen(true);
    try {
      const res = await fetch(`/api/transport-requests/details?document_no=${encodeURIComponent(request.Document_No)}`);
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      setSelectedRequest(data);
    } catch (err: any) {
      setDetailsError(err.message);
      setSelectedRequest(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const approveRequest = async (request: TransportRequestApprovalRecord) => {
    setApproving(true);
    try {
      const res = await fetch('/api/transport-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_no: request.Document_No
        })
      });
      if (!res.ok) throw new Error('Approval failed');
      toast({ title: "Success", description: "Transport request approved successfully", variant: "default" });
      setDetailsOpen(false);
      setSelectedRequest(null);
      // Refresh list
      setLoading(true);
      fetch("/api/transport-requests")
        .then(res => res.json())
        .then(data => setRecords(data))
        .finally(() => setLoading(false));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setApproving(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const text = [
      record.Document_No,
      record.Pay_to_Code,
      record.Pay_to_Name,
      record.Reason,
      record.Status_WF,
      record.Date_Sent,
      record.Sent_By,
    ].join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="text-muted-foreground" />
            <CardTitle>Transport Requests Approval</CardTitle>
          </div>
          <CardDescription>Approve transport requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="search-container" style={{ marginBottom: 15, width: '100%' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search transport requests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, height: 32 }}
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : fetchError ? (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              Error fetching transport requests: {fetchError}
              <br />
              <span style={{ fontSize: '0.9em', color: 'gray' }}>
                (Check the API route and backend logs.)
              </span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              No transport requests found.
            </div>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 4 }}>
              <Table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document No</TableHead>
                    <TableHead>Pay to Code</TableHead>
                    <TableHead>Pay to Name</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Sent By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, idx) => (
                    <TableRow
                      key={`${record.Document_No || 'row'}-${idx}`}
                      className="clickable-row"
                      style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#e6f3ff', cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                      onClick={() => handleViewDetails(record)}
                    >
                      <TableCell>{record.Document_No}</TableCell>
                      <TableCell>{record.Pay_to_Code}</TableCell>
                      <TableCell>{record.Pay_to_Name}</TableCell>
                      <TableCell>{record.Reason}</TableCell>
                      <TableCell>{record.Status_WF}</TableCell>
                      <TableCell>{record.Date_Sent}</TableCell>
                      <TableCell>{record.Sent_By}</TableCell>
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
            <DialogTitle>Transport Request Details</DialogTitle>
            <DialogDescription>
              Document: {selectedRequest?.Document_No}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : detailsError ? (
            <div className="py-4 px-4 bg-red-50 text-red-600 rounded">Error: {detailsError}</div>
          ) : selectedRequest ? (
            <div className="py-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Document No</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Document_No}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Pay to Code</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Pay_to_Code}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Pay to Name</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Pay_to_Name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                  <p className="text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedRequest.Status_WF === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedRequest.Status_WF || '-'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Reason</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Reason || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Comment</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Comment || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Sent By</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Sent_By || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Approver ID</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Approver_ID || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Date Sent</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Date_Sent || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Date Approved</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Date_Approved || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Dimension 1 Code</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Dimension_1_Code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Dimension 2 Code</p>
                  <p className="text-sm text-gray-900">{selectedRequest.Dimension_2_Code || '-'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No details available</div>
          )}
          <div className="flex gap-2 mt-6">
            <Button 
              onClick={() => approveRequest(selectedRequest!)}
              disabled={approving}
              style={{ backgroundColor: '#10b981', color: 'white' }}
            >
              {approving ? "Approving..." : "Approve Transport Request"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
