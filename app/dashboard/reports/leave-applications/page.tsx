"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, AlertCircle, FileX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { TrackingEmptyState } from "@/components/ui/tracking-empty-state"


interface LeaveApplicationRecord {
  No: string;
  Employee_No: string;
  Full_Name: string;
  Leave_Description: string;
  Start_Date: string;
  End_Date: string;
  Available_Leave_Days: number;
  Days_to_be_Taken_Commuted: number;
  Leave_Applied_for?: string;
  Date?: string;
  Address_whilst_on_leave?: string;
  Workflow_Route?: string;
  Dimension_1_Code?: string;
  Leave_Balance?: number;
  Current_User?: string;
  Sent_for_Checking?: boolean;
}


export default function LeaveApplicationsPage() {
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<LeaveApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplicationRecord | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/leave-applications/tracking")
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

  const handleViewDetails = async (leave: LeaveApplicationRecord) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsOpen(true);
    try {
      const res = await fetch(`/api/leave-applications/details?leave_no=${encodeURIComponent(leave.No)}`);
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      setSelectedLeave(data);
    } catch (err: any) {
      setDetailsError(err.message);
      setSelectedLeave(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const text = [
      record.No,
      record.Employee_No,
      record.Full_Name,
      record.Leave_Description,
      record.Start_Date,
      record.End_Date,
      record.Available_Leave_Days?.toString(),
      record.Days_to_be_Taken_Commuted?.toString(),
    ].join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground" />
            <CardTitle>Leave Applications</CardTitle>
          </div>
          <CardDescription>Track leave applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="search-container" style={{ marginBottom: 15, width: '100%' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search leave applications..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, height: 32 }}
            />
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="text-gray-500">Loading leave applications...</div>
            </div>
          ) : fetchError ? (
            <TrackingEmptyState
              type="error"
              title="Error Loading Leave Applications"
              description={fetchError}
            />
          ) : records.length === 0 ? (
            <TrackingEmptyState
              type="no-records"
              title="No Leave Applications"
              description="You don't have any leave applications yet. Submit a new leave application to get started."
            />
          ) : filteredRecords.length === 0 ? (
            <TrackingEmptyState
              type="no-search-results"
              title="No Matching Results"
              description="Your search didn't match any leave applications. Try adjusting your search criteria."
            />
          ) : (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 4 }}>
              <Table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave No</TableHead>
                    <TableHead>Employee No</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Leave Description</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Available Days</TableHead>
                    <TableHead>Days Requested</TableHead>
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
                      <TableCell>{record.Employee_No}</TableCell>
                      <TableCell>{record.Full_Name}</TableCell>
                      <TableCell>{record.Leave_Description}</TableCell>
                      <TableCell>{record.Start_Date?.slice(0, 10)}</TableCell>
                      <TableCell>{record.End_Date?.slice(0, 10)}</TableCell>
                      <TableCell>{record.Available_Leave_Days}</TableCell>
                      <TableCell>{record.Days_to_be_Taken_Commuted}</TableCell>
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
            <DialogTitle>Leave Application Details</DialogTitle>
            <DialogDescription>
              Leave No: {selectedLeave?.No}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : detailsError ? (
            <div className="py-4 px-4 bg-red-50 text-red-600 rounded">Error: {detailsError}</div>
          ) : selectedLeave ? (
            <div className="py-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Leave No</p>
                  <p className="text-sm text-gray-900">{selectedLeave.No}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Employee No</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Employee_No}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Full Name</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Full_Name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Leave Description</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Leave_Description || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Leave Type</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Leave_Applied_for || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Application Date</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Date?.slice(0, 10) || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Start Date</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Start_Date?.slice(0, 10) || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">End Date</p>
                  <p className="text-sm text-gray-900">{selectedLeave.End_Date?.slice(0, 10) || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Available Leave Days</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Available_Leave_Days || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Days Requested</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Days_to_be_Taken_Commuted || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Leave Balance</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Leave_Balance || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Address While on Leave</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Address_whilst_on_leave || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Workflow Route</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Workflow_Route || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Dimension Code</p>
                  <p className="text-sm text-gray-900">{selectedLeave.Dimension_1_Code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                  <p className="text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedLeave.Sent_for_Checking 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedLeave.Sent_for_Checking ? 'Pending Approval' : 'Draft'}
                    </span>
                  </p>
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
