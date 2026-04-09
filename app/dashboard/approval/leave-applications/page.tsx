"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"


interface LeaveApplicationApprovalRecord {
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


export default function LeaveApplicationsApprovalPage() {
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<LeaveApplicationApprovalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplicationApprovalRecord | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/leave-applications")
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

  const handleViewDetails = async (leave: LeaveApplicationApprovalRecord) => {
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

  const approveRequest = async (leave: LeaveApplicationApprovalRecord) => {
    setApproving(true);
    try {
      const res = await fetch('/api/leave-applications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leave_no: leave.No
        })
      });
      if (!res.ok) throw new Error('Approval failed');
      toast({ title: "Success", description: "Leave application approved successfully", variant: "default" });
      setDetailsOpen(false);
      setSelectedLeave(null);
      // Refresh list
      setLoading(true);
      fetch("/api/leave-applications")
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
      record.No,
      record.Employee_No,
      record.Full_Name,
      record.Leave_Description,
      record.Start_Date,
      record.End_Date,
    ].join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground" />
            <CardTitle>Leave Applications Approval</CardTitle>
          </div>
          <CardDescription>Approve leave application requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 w-full">
            <input
              type="text"
              className="w-full px-3 py-1.5 border border-border rounded-xl text-sm h-9 bg-background"
              placeholder="Search leave applications..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : fetchError ? (
            <div className="text-destructive font-bold">
              Error fetching leave applications: {fetchError}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-destructive font-bold">No leave applications found.</div>
          ) : (
            <div className="overflow-x-auto border border-border rounded">
              <Table className="w-full text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave No</TableHead>
                    <TableHead>Employee No</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Leave Description</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days Requested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, idx) => (
                    <TableRow
                      key={`${record.No || 'row'}-${idx}`}
                      className="cursor-pointer hover:bg-muted even:bg-muted/30"
                      onClick={() => handleViewDetails(record)}
                    >
                      <TableCell>{record.No}</TableCell>
                      <TableCell>{record.Employee_No}</TableCell>
                      <TableCell>{record.Full_Name}</TableCell>
                      <TableCell>{record.Leave_Description}</TableCell>
                      <TableCell>{record.Start_Date?.slice(0, 10)}</TableCell>
                      <TableCell>{record.End_Date?.slice(0, 10)}</TableCell>
                      <TableCell>{record.Days_to_be_Taken_Commuted}</TableCell>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No details available</div>
          )}
          <div className="flex justify-between gap-2 pt-4 border-t mt-6">
            <Button onClick={() => approveRequest(selectedLeave!)} disabled={approving} style={{ backgroundColor: '#10b981', color: 'white' }}>
              {approving ? "Approving..." : "Approve Leave Application"}
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
