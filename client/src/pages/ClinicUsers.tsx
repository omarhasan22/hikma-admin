import { useState } from "react";
import { useRoute, Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  useClinicUsers,
  useRemoveUserFromClinic,
  useUpdateUserRole
} from "@/hooks/use-clinic-users";
import { useAddDoctorToClinic } from "@/hooks/use-organizations";
import { useAddStaff } from "@/hooks/use-staff";
import { useOrganization } from "@/hooks/use-organizations";
import { useDoctors } from "@/hooks/use-doctors";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Loader2, 
  Plus, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User,
  Building2,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-50 text-purple-600 border-purple-200",
  admin: "bg-blue-50 text-blue-600 border-blue-200",
  doctor: "bg-green-50 text-green-600 border-green-200",
  secretary: "bg-orange-50 text-orange-600 border-orange-200",
  nurse: "bg-pink-50 text-pink-600 border-pink-200",
  assistant: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function ClinicUsersPage() {
  const [match, params] = useRoute("/organizations/:clinicId/users");
  const clinicId = params?.clinicId || "";
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isUpdateRoleOpen, setIsUpdateRoleOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    clinicUserId: string;
    userId: string;
    name: string;
    roles: string[];
  } | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'doctor' | 'secretary' | 'nurse' | 'assistant'>('doctor');
  const [addUserId, setAddUserId] = useState("");
  const [addUserRole, setAddUserRole] = useState<'admin' | 'doctor' | 'secretary' | 'nurse' | 'assistant'>('doctor');
  const [addUserMode, setAddUserMode] = useState<'existing' | 'new'>('existing');
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  const { data: clinicData, isLoading: clinicLoading } = useOrganization(clinicId);
  const { data: usersData, isLoading: usersLoading } = useClinicUsers(clinicId);
  const { data: doctorsData } = useDoctors({ isApproved: 'true' });
  const addUserMutation = useAddDoctorToClinic();
  const addStaffMutation = useAddStaff();
  const updateRoleMutation = useUpdateUserRole();
  const removeUserMutation = useRemoveUserFromClinic();

  const users = usersData?.data || [];
  
  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = !search || 
      `${user.users?.first_name || ''} ${user.users?.last_name || ''}`.toLowerCase().includes(search.toLowerCase()) ||
      user.users?.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      user.clinic_user_roles?.some(r => r.role === roleFilter);
    
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    // Staff roles (secretary, nurse, assistant) use the staff endpoint
    // Other roles (admin, doctor) use the clinic doctor endpoint
    const isStaffRole = ['secretary', 'nurse', 'assistant'].includes(addUserRole);
    
    if (isStaffRole) {
      // Use staff endpoint
      if (addUserMode === 'existing') {
        if (!addUserId || !addUserRole) return;
        addStaffMutation.mutate(
          {
            userId: addUserId,
            role: addUserRole as 'secretary' | 'nurse' | 'assistant',
            clinicId: clinicId
          },
          {
            onSuccess: () => {
              setIsAddUserOpen(false);
              setAddUserId("");
              setAddUserRole('doctor');
              setAddUserMode('existing');
            }
          }
        );
      } else {
        // New user mode
        if (!newUserPhone || !newUserFirstName || !addUserRole) return;
        addStaffMutation.mutate(
          {
            phone: newUserPhone,
            firstName: newUserFirstName,
            lastName: newUserLastName || undefined,
            email: newUserEmail || undefined,
            role: addUserRole as 'secretary' | 'nurse' | 'assistant',
            clinicId: clinicId
          },
          {
            onSuccess: () => {
              setIsAddUserOpen(false);
              setNewUserPhone("");
              setNewUserFirstName("");
              setNewUserLastName("");
              setNewUserEmail("");
              setAddUserRole('doctor');
              setAddUserMode('existing');
            }
          }
        );
      }
    } else {
      // Use clinic doctor endpoint for admin/doctor roles
      if (!addUserId || !addUserRole) return;
      addUserMutation.mutate(
        { 
          clinicId, 
          doctorId: addUserId, 
          role: addUserRole as 'admin' | 'doctor'
        },
        {
          onSuccess: () => {
            setIsAddUserOpen(false);
            setAddUserId("");
            setAddUserRole('doctor');
            setAddUserMode('existing');
          }
        }
      );
    }
  };

  const handleUpdateRole = () => {
    if (!selectedUser || !newRole) return;
    
    updateRoleMutation.mutate(
      { clinicId, doctorId: selectedUser.userId, role: newRole },
      {
        onSuccess: () => {
          setIsUpdateRoleOpen(false);
          setSelectedUser(null);
        }
      }
    );
  };

  const handleRemoveUser = () => {
    if (!selectedUser) return;
    
    removeUserMutation.mutate(
      { clinicId, doctorId: selectedUser.userId },
      {
        onSuccess: () => {
          setIsRemoveOpen(false);
          setSelectedUser(null);
        }
      }
    );
  };

  const openUpdateRoleDialog = (user: typeof users[0]) => {
    const roles = user.clinic_user_roles?.map(r => r.role) || [];
    setSelectedUser({
      clinicUserId: user.id,
      userId: user.users?.id || "",
      name: `${user.users?.first_name || ''} ${user.users?.last_name || ''}`.trim() || 'Unknown',
      roles
    });
    // Set default role to first non-owner role, or doctor
    const nonOwnerRole = roles.find(r => r !== 'owner') as typeof newRole;
    setNewRole(nonOwnerRole || 'doctor');
    setIsUpdateRoleOpen(true);
  };

  const openRemoveDialog = (user: typeof users[0]) => {
    const roles = user.clinic_user_roles?.map(r => r.role) || [];
    setSelectedUser({
      clinicUserId: user.id,
      userId: user.users?.id || "",
      name: `${user.users?.first_name || ''} ${user.users?.last_name || ''}`.trim() || 'Unknown',
      roles
    });
    setIsRemoveOpen(true);
  };

  const isOwner = (user: typeof users[0]) => {
    return user.clinic_user_roles?.some(r => r.role === 'owner') || false;
  };

  if (!match || !clinicId) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Clinic not found</p>
          <Link href="/organizations">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Organizations
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/organizations">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                {clinicLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin inline" />
                ) : (
                  clinicData?.name || "Clinic Users"
                )}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage all users and their roles in this clinic
              </p>
            </div>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add User to Clinic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={addUserRole} onValueChange={(value) => {
                    setAddUserRole(value as typeof addUserRole);
                    // For staff roles, allow new user creation
                    if (['secretary', 'nurse', 'assistant'].includes(value)) {
                      // Keep current mode or default to existing
                    } else {
                      // For admin/doctor, only existing users
                      setAddUserMode('existing');
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mode selector for staff roles */}
                {['secretary', 'nurse', 'assistant'].includes(addUserRole) && (
                  <div>
                    <Label>Add Mode</Label>
                    <Select value={addUserMode} onValueChange={(value) => setAddUserMode(value as 'existing' | 'new')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="existing">Select Existing User</SelectItem>
                        <SelectItem value="new">Create New User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Existing user mode */}
                {addUserMode === 'existing' && (
                  <div>
                    <Label htmlFor="user">User (Provider) *</Label>
                    <Select value={addUserId} onValueChange={setAddUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorsData?.data
                          ?.filter(doctor => {
                            // Filter out users already in this clinic
                            const userIds = users.map(u => u.users?.id).filter(Boolean);
                            return !userIds.includes(doctor.id);
                          })
                          .map((doctor) => {
                            const displayName = doctor.user?.full_name || 
                              `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.trim() || 
                              `User ${doctor.id.substring(0, 8)}`;
                            return (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {displayName}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only approved providers can be added.
                    </p>
                  </div>
                )}

                {/* New user mode (only for staff roles) */}
                {addUserMode === 'new' && ['secretary', 'nurse', 'assistant'].includes(addUserRole) && (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+9611234567"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Phone number will be used for authentication.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={newUserFirstName}
                        onChange={(e) => setNewUserFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={newUserLastName}
                        onChange={(e) => setNewUserLastName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Optional. A new provider account will be created automatically.
                      </p>
                    </div>
                  </>
                )}

                <Button 
                  className="w-full"
                  onClick={handleAddUser}
                  disabled={
                    addUserMutation.isPending || 
                    addStaffMutation.isPending ||
                    !addUserRole ||
                    (addUserMode === 'existing' && !addUserId) ||
                    (addUserMode === 'new' && (!newUserPhone || !newUserFirstName))
                  }
                >
                  {(addUserMutation.isPending || addStaffMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {addUserMode === 'new' ? 'Create & Add User' : 'Add User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Search */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="secretary">Secretary</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-border focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {usersLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/30 border-b border-border">
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const userName = `${user.users?.first_name || ''} ${user.users?.last_name || ''}`.trim() || 'Unknown';
                  const userEmail = user.users?.email || 'No email';
                  const roles = user.clinic_user_roles?.map(r => r.role) || [];
                  const hasOwnerRole = isOwner(user);
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.users?.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{userName}</div>
                            {user.is_primary && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                Primary Clinic
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{userEmail}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {roles.map((role) => (
                            <Badge 
                              key={role}
                              variant="outline" 
                              className={cn("capitalize text-xs", ROLE_COLORS[role] || "bg-gray-50 text-gray-600 border-gray-200")}
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {hasOwnerRole ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                            Owner
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                            Member
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8"
                            onClick={() => openUpdateRoleDialog(user)}
                            disabled={hasOwnerRole}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openRemoveDialog(user)}
                            disabled={hasOwnerRole}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {users.length === 0 ? "No users found in this clinic." : "No users match your filters."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Update Role Dialog */}
        <Dialog open={isUpdateRoleOpen} onOpenChange={setIsUpdateRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>User</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedUser?.name}</p>
              </div>
              <div>
                <Label>Current Roles</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedUser?.roles.map((role) => (
                    <Badge 
                      key={role}
                      variant="outline" 
                      className={cn("capitalize", ROLE_COLORS[role] || "bg-gray-50 text-gray-600 border-gray-200")}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="newRole">New Role *</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as typeof newRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="secretary">Secretary</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Note: This will update the user's role. Owner role cannot be changed.
                </p>
              </div>
              <Button 
                className="w-full"
                onClick={handleUpdateRole}
                disabled={!newRole || updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove Confirmation Dialog */}
        <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove User from Clinic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to remove <strong>{selectedUser?.name}</strong> from this clinic?
              </p>
              {selectedUser?.roles.includes('owner') && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Warning:</strong> This user is an owner. Owners cannot be removed from clinics.
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsRemoveOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleRemoveUser}
                  disabled={selectedUser?.roles.includes('owner') || removeUserMutation.isPending}
                >
                  {removeUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Remove
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
