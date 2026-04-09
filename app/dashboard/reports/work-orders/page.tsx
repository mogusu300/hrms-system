"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"


interface WorkOrderRecord {
  No: string;
  Asset_Description: string;
  Equipment_No: string;
  Date_Raised: string;
  Status: string;
  Description?: string;
  Work_Description?: string;
  Nature_of_Work?: string;
}


export default function WorkOrdersPage() {
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<WorkOrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderRecord | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/work-orders")
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

  const handleViewDetails = async (workOrder: WorkOrderRecord) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsOpen(true);
    try {
      const res = await fetch(`/api/work-orders/details?no=${encodeURIComponent(workOrder.No)}`);
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      setSelectedWorkOrder(data);
    } catch (err: any) {
      setDetailsError(err.message);
      setSelectedWorkOrder(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const text = [
      record.No,
      record.Asset_Description,
      record.Equipment_No,
      record.Date_Raised,
      record.Status,
    ].join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'bg-green-100 text-green-800';
    if (status === 'Released') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="text-muted-foreground" />
            <CardTitle>Work Orders</CardTitle>
          </div>
          <CardDescription>Track work orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="search-container" style={{ marginBottom: 15, width: '100%' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by Asset Description or WO No..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, height: 32 }}
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : fetchError ? (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              Error fetching work orders: {fetchError}
              <br />
              <span style={{ fontSize: '0.9em', color: 'gray' }}>
                (Check the API route and backend logs.)
              </span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              No work orders found.
            </div>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 4 }}>
              <Table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO No</TableHead>
                    <TableHead>Asset Description</TableHead>
                    <TableHead>Equipment No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, idx) => (
                    <TableRow
                      key={`${record.No || 'row'}-${idx}`}
                      className="clickable-row"
                      style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#e6f3ff', cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                      onClick={() => handleViewDetails(record)}
                    >
                      <TableCell>{record.No}</TableCell>
                      <TableCell>{record.Asset_Description}</TableCell>
                      <TableCell>{record.Equipment_No}</TableCell>
                      <TableCell>{record.Date_Raised}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.Status)}`}>
                          {record.Status}
                        </span>
                      </TableCell>
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
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              WO No: {selectedWorkOrder?.No}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : detailsError ? (
            <div className="py-4 px-4 bg-red-50 text-red-600 rounded">Error: {detailsError}</div>
          ) : selectedWorkOrder ? (
            <div className="py-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">WO Number</p>
                  <p className="text-sm text-gray-900">{selectedWorkOrder.No}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Equipment No</p>
                  <p className="text-sm text-gray-900">{selectedWorkOrder.Equipment_No || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
                  <p className="text-sm text-gray-900">{selectedWorkOrder.Description || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Work Description</p>
                  <p className="text-sm text-gray-900">{selectedWorkOrder.Work_Description || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Nature of Work</p>
                  <p className="text-sm text-gray-900">{selectedWorkOrder.Nature_of_Work || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Asset Description</p>
                  <p className="text-sm text-gray-900">{selectedWorkOrder.Asset_Description || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                  <p className="text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedWorkOrder.Status)}`}>
                      {selectedWorkOrder.Status || '-'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Date Raised</p>
                  <p className="text-sm text-gray-900">{selectedWorkOrder.Date_Raised || '-'}</p>
                </div>
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
