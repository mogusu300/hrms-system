"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"


interface PurchaseRecord {
  Document_No: string;
  Document_Type: string;
  Currency_Code: string;
  Originator: string;
  Date_Sent: string;
  Amount: number;
  Status_RP?: string;
  Reason?: string;
  Approver_ID?: string;
  Sent_By?: string;
  Delegated_By?: string;
  Date_Created?: string;
  Dimension_1_Code?: string;
  Dimension_2_Code?: string;
}


export default function PurchaseTrackingPage() {
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/purchase-tracking/tracking")
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

  const handleViewDetails = async (purchase: PurchaseRecord) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsOpen(true);
    try {
      const res = await fetch(`/api/purchase-tracking/details?document_no=${encodeURIComponent(purchase.Document_No)}`);
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      setSelectedPurchase(data);
    } catch (err: any) {
      setDetailsError(err.message);
      setSelectedPurchase(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const text = [
      record.Document_No,
      record.Document_Type,
      record.Currency_Code,
      record.Originator,
      record.Date_Sent,
      record.Amount?.toString(),
    ].join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-muted-foreground" />
            <CardTitle>Purchase Tracking</CardTitle>
          </div>
          <CardDescription>Track purchase requisitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="search-container" style={{ marginBottom: 15, width: '100%' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search purchases..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, height: 32 }}
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : fetchError ? (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              Error fetching purchases: {fetchError}
              <br />
              <span style={{ fontSize: '0.9em', color: 'gray' }}>
                (Check the API route and backend logs.)
              </span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              No purchases found.
            </div>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 4 }}>
              <Table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document No</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Currency Code</TableHead>
                    <TableHead>Originator</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Amount</TableHead>
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
                      <TableCell>{record.Document_Type}</TableCell>
                      <TableCell>{record.Currency_Code}</TableCell>
                      <TableCell>{record.Originator}</TableCell>
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
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>
              Document: {selectedPurchase?.Document_No}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : detailsError ? (
            <div className="py-4 px-4 bg-red-50 text-red-600 rounded">Error: {detailsError}</div>
          ) : selectedPurchase ? (
            <div className="py-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Document No</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Document_No}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Document Type</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Document_Type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                  <p className="text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPurchase.Status_RP === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedPurchase.Status_RP || '-'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Currency Code</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Currency_Code}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Amount</p>
                  <p className="text-sm text-gray-900 font-medium">{typeof selectedPurchase.Amount === 'number' ? selectedPurchase.Amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : selectedPurchase.Amount}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Originator</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Originator}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Approver ID</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Approver_ID || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Sent By</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Sent_By || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Delegated By</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Delegated_By || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Date Created</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Date_Created || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Date Sent</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Date_Sent || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Dimension 1 Code</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Dimension_1_Code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Dimension 2 Code</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Dimension_2_Code || '-'}</p>
                </div>
              </div>
              {selectedPurchase.Reason && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Reason</p>
                  <p className="text-sm text-gray-900">{selectedPurchase.Reason}</p>
                </div>
              )}
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
