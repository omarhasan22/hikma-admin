import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  useOrganizations, 
  useApproveOrganization, 
  useRejectOrganization, 
  useSuspendOrganization,
  useDeleteOrganization,
  useCreateOrganization
} from "@/hooks/use-organizations";
import { useDoctors } from "@/hooks/use-doctors";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle, XCircle, Ban, Trash2, Building2, Plus } from "lucide-react";

export default function OrganizationsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
  const [search, setSearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'suspend' | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: orgsData, isLoading } = useOrganizations({
    search: search || undefined,
    status: filter === 'all' ? undefined : filter
  });

  const { data: doctorsData } = useDoctors({ isApproved: 'true' });
  const approveMutation = useApproveOrganization();
  const rejectMutation = useRejectOrganization();
  const suspendMutation = useSuspendOrganization();
  const deleteMutation = useDeleteOrganization();
  const createMutation = useCreateOrganization();

  const handleApprove = (clinicId: string) => {
    approveMutation.mutate(clinicId);
  };

  const handleReject = () => {
    if (selectedOrgId && rejectReason) {
      rejectMutation.mutate({ clinicId: selectedOrgId, reason: rejectReason });
      setSelectedOrgId(null);
      setRejectReason("");
      setActionType(null);
    }
  };

  const handleSuspend = () => {
    if (selectedOrgId && suspendReason) {
      suspendMutation.mutate({ clinicId: selectedOrgId, reason: suspendReason });
      setSelectedOrgId(null);
      setSuspendReason("");
      setActionType(null);
    }
  };

  const handleDelete = (clinicId: string) => {
    if (confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      deleteMutation.mutate(clinicId);
    }
  };

  const filteredOrgs = orgsData?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Organizations</h1>
            <p className="text-muted-foreground mt-1">Manage clinics and medical facilities.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add New Clinic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Clinic</DialogTitle>
              </DialogHeader>
              <ClinicForm 
                doctors={doctorsData?.data || []}
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
            {(['all', 'pending', 'approved', 'suspended'] as const).map((f) => (
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
              placeholder="Search organizations..." 
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
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => {
                  const status = org.status || (org.is_approved ? 'approved' : 'pending');
                  return (
                    <TableRow key={org.id} className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors">
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{org.name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {org.type || "clinic"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{org.phone || "N/A"}</TableCell>
                      <TableCell className="text-muted-foreground">{org.email || "No email"}</TableCell>
                      <TableCell>
                        {status === 'approved' ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Approved</Badge>
                        ) : status === 'pending' ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>
                        ) : status === 'suspended' ? (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Suspended</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Rejected</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => handleApprove(String(org.id))}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                  setSelectedOrgId(String(org.id));
                                  setActionType('reject');
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          
                          {status === 'approved' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                              onClick={() => {
                                setSelectedOrgId(String(org.id));
                                setActionType('suspend');
                              }}
                            >
                              <Ban className="w-4 h-4 mr-1" /> Suspend
                            </Button>
                          )}

                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(String(org.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredOrgs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No organizations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Reject Dialog */}
        <Dialog open={actionType === 'reject'} onOpenChange={(open) => !open && setActionType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Organization</DialogTitle>
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

        {/* Suspend Dialog */}
        <Dialog open={actionType === 'suspend'} onOpenChange={(open) => !open && setActionType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Organization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input 
                placeholder="Reason for suspension..." 
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleSuspend}
                disabled={!suspendReason}
              >
                Confirm Suspension
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function ClinicForm({ 
  doctors,
  onSubmit, 
  isLoading 
}: { 
  doctors: Array<{ id: string; user?: { first_name?: string; last_name?: string; full_name?: string } | null }>;
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timezone, setTimezone] = useState("Asia/Beirut");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: any = {
      name,
      ownerId,
    };

    if (description) formData.description = description;
    if (phone) formData.phone = phone;
    if (email) formData.email = email;
    if (website) formData.website = website;
    if (address) formData.address = address;
    if (timezone) formData.timezone = timezone;
    if (latitude) formData.latitude = parseFloat(latitude);
    if (longitude) formData.longitude = parseFloat(longitude);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="name">Clinic Name *</Label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Hikma Medical Center"
        />
      </div>

      <div>
        <Label htmlFor="ownerId">Owner (Doctor) *</Label>
        <Select value={ownerId} onValueChange={setOwnerId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a doctor as clinic owner" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => {
              const displayName = doctor.user?.full_name || 
                `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.trim() || 
                `Doctor ${doctor.id.substring(0, 8)}`;
              return (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {displayName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Only approved doctors can be selected as clinic owners.
        </p>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Clinic description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="+1234567890"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="clinic@example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input 
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          type="url"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input 
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            type="number"
            step="any"
            placeholder="33.8547"
          />
        </div>

        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input 
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            type="number"
            step="any"
            placeholder="35.8623"
          />
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input 
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Asia/Beirut"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading || !name || !ownerId}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Create Clinic
      </Button>
    </form>
  );
}

