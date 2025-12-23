import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDoctors, useApproveDoctor, useRejectDoctor, useSetVipDoctor } from "@/hooks/use-doctors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle, XCircle, Star, Filter } from "lucide-react";
import { format } from "date-fns";

export default function DoctorsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'vip'>('all');
  const [search, setSearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  const { data: doctorsData, isLoading } = useDoctors({
    search: search || undefined,
    isApproved: filter === 'pending' ? 'false' : undefined,
    isVip: filter === 'vip' ? 'true' : undefined
  });

  const approveMutation = useApproveDoctor();
  const rejectMutation = useRejectDoctor();
  const setVipMutation = useSetVipDoctor();

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    if (selectedDoctorId && rejectReason) {
      rejectMutation.mutate({ id: selectedDoctorId, reason: rejectReason });
      setSelectedDoctorId(null);
      setRejectReason("");
    }
  };

  const handleToggleVip = (id: number, currentStatus: boolean) => {
    setVipMutation.mutate({ id, isVip: !currentStatus });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Doctors</h1>
            <p className="text-muted-foreground mt-1">Manage doctor profiles and verifications.</p>
          </div>
          <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl">
            Add New Doctor
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-auto">
            {(['all', 'pending', 'vip'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f 
                    ? "bg-white dark:bg-black shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                } capitalize`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-border focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/30 border-b border-border">
                  <TableHead className="w-[250px] pl-6">Doctor Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>VIP</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorsData?.data.map((doctor) => (
                  <TableRow key={doctor.id} className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors">
                    <TableCell className="font-medium pl-6">
                      <div className="flex flex-col">
                        <span className="text-base">{doctor.fullName}</span>
                        <span className="text-xs text-muted-foreground">{doctor.email || "No email"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{doctor.phone}</TableCell>
                    <TableCell>
                      {doctor.isApproved ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Approved</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.isVip ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1">
                          <Star className="w-3 h-3 fill-amber-600" /> VIP
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{doctor.rating || "0.0"}</span>
                        <span className="text-xs text-muted-foreground">({doctor.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {!doctor.isApproved && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handleApprove(doctor.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setSelectedDoctorId(doctor.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Application</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <Input 
                                    placeholder="Reason for rejection..." 
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                  />
                                  <Button 
                                    variant="destructive" 
                                    className="w-full"
                                    onClick={handleReject}
                                    disabled={!rejectReason}
                                  >
                                    Confirm Rejection
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className={doctor.isVip ? "text-amber-600 bg-amber-50" : "text-muted-foreground"}
                          onClick={() => handleToggleVip(doctor.id, doctor.isVip || false)}
                        >
                          <Star className={doctor.isVip ? "w-4 h-4 fill-current" : "w-4 h-4"} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {doctorsData?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No doctors found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
