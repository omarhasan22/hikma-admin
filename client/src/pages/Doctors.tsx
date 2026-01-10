import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDoctors, useApproveDoctor, useRejectDoctor, useSetVipDoctor, useCreateDoctor, useDeleteDoctor } from "@/hooks/use-doctors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle, XCircle, Star, Filter, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

export default function DoctorsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'vip'>('all');
  const [search, setSearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: doctorsData, isLoading } = useDoctors({
    search: search || undefined,
    isApproved: filter === 'pending' ? 'false' : undefined,
    isVip: filter === 'vip' ? 'true' : undefined
  });

  const approveMutation = useApproveDoctor();
  const rejectMutation = useRejectDoctor();
  const setVipMutation = useSetVipDoctor();
  const createMutation = useCreateDoctor();
  const deleteMutation = useDeleteDoctor();

  const handleDelete = (doctorId: string) => {
    if (confirm("Are you sure you want to delete this doctor and their user account? This action cannot be undone.")) {
      deleteMutation.mutate(doctorId);
    }
  };

  const handleApprove = (doctorId: string) => {
    approveMutation.mutate(doctorId);
  };

  const handleReject = () => {
    if (selectedDoctorId && rejectReason) {
      rejectMutation.mutate({ doctorId: selectedDoctorId, reason: rejectReason });
      setSelectedDoctorId(null);
      setRejectReason("");
    }
  };

  const handleToggleVip = (doctorId: string, currentStatus: boolean) => {
    setVipMutation.mutate({ doctorId, isVip: !currentStatus });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Doctors</h1>
            <p className="text-muted-foreground mt-1">Manage doctor profiles and verifications.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add New Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Doctor</DialogTitle>
              </DialogHeader>
              <DoctorForm 
                onSubmit={(data) => {
                  createMutation.mutate(data as any, {
                    onSuccess: () => setIsCreateOpen(false)
                  });
                }}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
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
                  <TableHead className="w-[100px] pl-6">Avatar</TableHead>
                  <TableHead className="w-[250px]">Doctor Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>VIP</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorsData?.data.map((doctor) => (
                  <TableRow 
                    key={doctor.id} 
                    className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors"
                  >
                    <TableCell 
                      className="pl-6 cursor-pointer"
                      onClick={() => window.location.href = `/doctors/${doctor.id}`}
                    >
                      {doctor.user?.avatar_url || doctor.avatar_url ? (
                        <img 
                          src={doctor.user?.avatar_url || doctor.avatar_url} 
                          alt={doctor.user?.full_name || doctor.full_name || "Doctor"} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                          <Stethoscope className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell 
                      className="font-medium cursor-pointer"
                      onClick={() => window.location.href = `/doctors/${doctor.id}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-base">{doctor.user?.full_name || doctor.full_name || "N/A"}</span>
                        <span className="text-xs text-muted-foreground">{doctor.user?.email || doctor.email || "No email"}</span>
                      </div>
                    </TableCell>
                    <TableCell 
                      className="text-muted-foreground cursor-pointer"
                      onClick={() => window.location.href = `/doctors/${doctor.id}`}
                    >
                      {doctor.user?.phone || doctor.phone || "N/A"}
                    </TableCell>
                    <TableCell>
                      {doctor.is_approved || doctor.isApproved ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Approved</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.is_vip || doctor.isVip ? (
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
                        <span className="font-medium">{doctor.rating_average || doctor.rating || "0.0"}</span>
                        <span className="text-xs text-muted-foreground">({doctor.rating_count || doctor.reviewCount || 0})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {!(doctor.is_approved || doctor.isApproved) && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handleApprove(String(doctor.id))}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setSelectedDoctorId(String(doctor.id))}
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
                          className={(doctor.is_vip || doctor.isVip) ? "text-amber-600 bg-amber-50" : "text-muted-foreground"}
                          onClick={() => handleToggleVip(String(doctor.id), doctor.is_vip || doctor.isVip || false)}
                        >
                          <Star className={(doctor.is_vip || doctor.isVip) ? "w-4 h-4 fill-current" : "w-4 h-4"} />
                        </Button>

                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(String(doctor.id))}
                          disabled={deleteMutation.isPending}
                          title="Delete doctor and user account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {doctorsData?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
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

function DoctorForm({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("fullName", fullName);
    if (email) formData.append("email", email);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input 
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          type="tel"
          placeholder="+1234567890"
        />
        <p className="text-sm text-muted-foreground mt-1">
          The phone number must be unique and will be used to create the doctor account.
        </p>
      </div>

      <div>
        <Label htmlFor="fullName">Full Name *</Label>
        <Input 
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Dr. John Doe"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="doctor@example.com"
        />
      </div>

      <div>
        <Label htmlFor="avatar">Avatar Image</Label>
        <Input 
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
        {avatarPreview && (
          <div className="mt-2">
            <img 
              src={avatarPreview} 
              alt="Avatar preview" 
              className="w-24 h-24 object-cover rounded-lg border border-border"
            />
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Create Doctor
      </Button>
    </form>
  );
}
