import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  useDoctors,
  useApproveDoctor,
  useRejectDoctor,
  useSetVipDoctor,
  useDeleteDoctor,
  useUpdateDoctor,
} from '@/hooks/use-doctors';
import { useOrganizations, useAddDoctorToClinic } from '@/hooks/use-organizations';
import { useServices } from '@/hooks/use-services';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Star,
  Filter,
  Plus,
  Trash2,
  Stethoscope,
  Building2,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DoctorsPage() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<'all' | 'pending' | 'vip'>('all');
  const [search, setSearch] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isAddToClinicOpen, setIsAddToClinicOpen] = useState(false);
  const [doctorToAdd, setDoctorToAdd] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'doctor'>('doctor');

  const { data: doctorsData, isLoading } = useDoctors({
    search: search || undefined,
    isApproved: filter === 'pending' ? 'false' : undefined,
    isVip: filter === 'vip' ? 'true' : undefined,
  });

  const approveMutation = useApproveDoctor();
  const rejectMutation = useRejectDoctor();
  const setVipMutation = useSetVipDoctor();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();
  const addToClinicMutation = useAddDoctorToClinic();
  const { data: organizationsData } = useOrganizations({ status: 'approved' });

  const handleDelete = (doctorId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this doctor and their user account? This action cannot be undone.',
      )
    ) {
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
      setRejectReason('');
    }
  };

  const handleToggleVip = (doctorId: string, currentStatus: boolean) => {
    setVipMutation.mutate({ doctorId, isVip: !currentStatus });
  };

  const handleOpenAddToClinic = (doctorId: string) => {
    setDoctorToAdd(doctorId);
    setSelectedClinicId('');
    setSelectedRole('doctor');
    setIsAddToClinicOpen(true);
  };

  const handleAddToClinic = () => {
    if (doctorToAdd && selectedClinicId) {
      addToClinicMutation.mutate(
        { clinicId: selectedClinicId, doctorId: doctorToAdd, role: selectedRole },
        {
          onSuccess: () => {
            setIsAddToClinicOpen(false);
            setDoctorToAdd(null);
            setSelectedClinicId('');
          },
        }
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Doctors</h1>
            <p className="text-muted-foreground mt-1">Manage doctor profiles and verifications.</p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl"
            onClick={() => setLocation("/doctors/new")}
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Doctor
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
                    ? 'bg-white dark:bg-black shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
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
                    <TableCell className="pl-6">
                      <Link href={`/doctors/${doctor.id}`} className="block">
                        {doctor.user?.avatar_url || doctor.avatar_url ? (
                          <img
                            src={doctor.user?.avatar_url || doctor.avatar_url}
                            alt={doctor.user?.full_name || doctor.full_name || 'Doctor'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                            <Stethoscope className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/doctors/${doctor.id}`} className="block">
                        <div className="flex flex-col">
                          <span className="text-base">
                            {(() => {
                              const doctorAny = doctor as any;
                              const user = doctorAny.user;
                              // Try full_name first
                              if (user?.full_name || doctorAny.full_name) {
                                return user?.full_name || doctorAny.full_name;
                              }
                              // Try to construct from first_name and last_name
                              const firstName = user?.first_name || doctorAny.first_name || user?.firstName || doctorAny.firstName;
                              const lastName = user?.last_name || doctorAny.last_name || user?.lastName || doctorAny.lastName;
                              if (firstName || lastName) {
                                return `${firstName || ''} ${lastName || ''}`.trim() || 'N/A';
                              }
                              // Fallback to fullName (camelCase)
                              return user?.fullName || doctorAny.fullName || 'N/A';
                            })()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(doctor as any).user?.email || (doctor as any).email || 'No email'}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground cursor-pointer"
                      onClick={() => (window.location.href = `/doctors/${doctor.id}`)}
                    >
                      {doctor.user?.phone || doctor.phone || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {doctor.is_approved || doctor.isApproved ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-600 border-emerald-200"
                        >
                          Approved
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-600 border-amber-200"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.is_vip || doctor.isVip ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-600 border-amber-200 gap-1"
                        >
                          <Star className="w-3 h-3 fill-amber-600" /> VIP
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {doctor.rating_average || doctor.rating || '0.0'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({doctor.rating_count || doctor.reviewCount || 0})
                        </span>
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
                          className={
                            doctor.is_vip || doctor.isVip
                              ? 'text-amber-600 bg-amber-50'
                              : 'text-muted-foreground'
                          }
                          onClick={() =>
                            handleToggleVip(
                              String(doctor.id),
                              doctor.is_vip || doctor.isVip || false,
                            )
                          }
                        >
                          <Star
                            className={
                              doctor.is_vip || doctor.isVip ? 'w-4 h-4 fill-current' : 'w-4 h-4'
                            }
                          />
                        </Button>

                        <Dialog open={isAddToClinicOpen && doctorToAdd === doctor.id} onOpenChange={(open) => {
                          if (!open) {
                            setIsAddToClinicOpen(false);
                            setDoctorToAdd(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddToClinic(String(doctor.id));
                              }}
                              title="Add doctor to clinic"
                            >
                              <Building2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Doctor to Clinic</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label htmlFor="clinic-select">Select Clinic</Label>
                                <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                                  <SelectTrigger id="clinic-select">
                                    <SelectValue placeholder="Choose a clinic..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {organizationsData?.data?.map((clinic) => (
                                      <SelectItem key={clinic.id} value={clinic.id}>
                                        {clinic.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="role-select">Role</Label>
                                <Select value={selectedRole} onValueChange={(value: 'admin' | 'doctor') => setSelectedRole(value)}>
                                  <SelectTrigger id="role-select">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="doctor">Doctor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                className="w-full"
                                onClick={handleAddToClinic}
                                disabled={!selectedClinicId || addToClinicMutation.isPending}
                              >
                                {addToClinicMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Add to Clinic
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/doctors/${doctor.id}?edit=true`);
                          }}
                          title="Edit doctor"
                        >
                          <Edit className="w-4 h-4" />
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

export function DoctorForm({
  doctor,
  onSubmit,
  isLoading,
}: {
  doctor?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const isEditMode = !!doctor;
  const { data: specialtiesData } = useServices();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [firstNameAr, setFirstNameAr] = useState('');
  const [lastName, setLastName] = useState('');
  const [lastNameAr, setLastNameAr] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [specialtyId, setSpecialtyId] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [university, setUniversity] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form fields from doctor data when editing
  useEffect(() => {
    if (doctor) {
      const user = doctor.user || {};
      const specialty = doctor.specialty || {};
      
      setPhone(user.phone || doctor.phone || '');
      setFirstName(user.first_name || doctor.first_name || '');
      setFirstNameAr(user.first_name_ar || doctor.first_name_ar || '');
      setLastName(user.last_name || doctor.last_name || '');
      setLastNameAr(user.last_name_ar || doctor.last_name_ar || '');
      setEmail(user.email || doctor.email || '');
      setBio(user.bio || doctor.bio || '');
      setBioAr(user.bio_ar || doctor.bio_ar || '');
      // Convert specialty_id to string for Select component, with fallbacks
      setSpecialtyId(String(doctor.specialty_id || specialty.id || doctor.specialtyId || ''));
      setLicenseNumber(doctor.license_number || doctor.licenseNumber || '');
      // Handle numeric fields with proper null checking
      setExperienceYears(
        doctor.experience_years !== null && doctor.experience_years !== undefined
          ? String(doctor.experience_years)
          : doctor.experienceYears !== null && doctor.experienceYears !== undefined
          ? String(doctor.experienceYears)
          : ''
      );
      setAddress(doctor.address || '');
      // Handle latitude/longitude with proper null checking
      setLatitude(
        doctor.latitude !== null && doctor.latitude !== undefined
          ? String(doctor.latitude)
          : ''
      );
      setLongitude(
        doctor.longitude !== null && doctor.longitude !== undefined
          ? String(doctor.longitude)
          : ''
      );
      setWhatsapp(doctor.whatsapp || '');
      setUniversity(doctor.university || '');
      setAvatarPreview(user.avatar_url || doctor.avatar_url || null);
      // Don't set username/password in edit mode
    } else {
      // Reset all fields for create mode
      setUsername('');
      setPassword('');
      setPhone('');
      setFirstName('');
      setFirstNameAr('');
      setLastName('');
      setLastNameAr('');
      setEmail('');
      setBio('');
      setBioAr('');
      setSpecialtyId('');
      setLicenseNumber('');
      setExperienceYears('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setWhatsapp('');
      setUniversity('');
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [doctor]);

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

    if (isEditMode) {
      // For edit mode, use JSON format (can include FormData if avatar is being updated)
      const data: any = {
        phone,
        firstName,
        lastName,
        email: email || undefined,
      };
      
      if (firstNameAr) data.firstNameAr = firstNameAr;
      if (lastNameAr) data.lastNameAr = lastNameAr;
      if (bio) data.bio = bio;
      if (bioAr) data.bioAr = bioAr;
      if (specialtyId) data.specialtyId = specialtyId;
      if (licenseNumber) data.licenseNumber = licenseNumber;
      if (experienceYears) data.experienceYears = parseInt(experienceYears) || undefined;
      if (address) data.address = address;
      if (latitude) data.latitude = parseFloat(latitude) || undefined;
      if (longitude) data.longitude = parseFloat(longitude) || undefined;
      if (whatsapp) data.whatsapp = whatsapp;
      if (university) data.university = university;
      
      // If avatar file is provided, use FormData
      if (avatarFile) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined) {
            formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]));
          }
        });
        formData.append('avatar', avatarFile);
        onSubmit(formData);
      } else {
        onSubmit(data);
      }
    } else {
      // For create mode, use FormData
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('phone', phone);
      formData.append('firstName', firstName);
      if (firstNameAr) formData.append('firstNameAr', firstNameAr);
      formData.append('lastName', lastName);
      if (lastNameAr) formData.append('lastNameAr', lastNameAr);
      if (email) formData.append('email', email);
      if (bio) formData.append('bio', bio);
      if (bioAr) formData.append('bio_ar', bioAr);
      if (specialtyId) formData.append('specialtyId', specialtyId);
      if (licenseNumber) formData.append('licenseNumber', licenseNumber);
      if (experienceYears) formData.append('experienceYears', experienceYears);
      if (address) formData.append('address', address);
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (whatsapp) formData.append('whatsapp', whatsapp);
      if (university) formData.append('university', university);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {!isEditMode && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> Doctors cannot signup themselves. The superadmin creates doctor
            accounts with username and password. The doctor will use these credentials to login with
            username + password + phone OTP verification.
          </p>
        </div>
      )}

      {!isEditMode && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              required
              minLength={3}
              maxLength={50}
              placeholder="doctor123"
              pattern="[a-z0-9]{3,50}"
              title="3-50 alphanumeric characters only"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Alphanumeric only, 3-50 characters. Used for login.
            </p>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={100}
              placeholder="••••••••"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum 6 characters. Share securely with the doctor.
            </p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          type="tel"
          placeholder="+96171123456"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Must be unique. Used for OTP verification during login.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name (English) *</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="John"
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name (English) *</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstNameAr">First Name (Arabic)</Label>
          <Input
            id="firstNameAr"
            value={firstNameAr}
            onChange={(e) => setFirstNameAr(e.target.value)}
            placeholder="جون"
            dir="rtl"
          />
        </div>

        <div>
          <Label htmlFor="lastNameAr">Last Name (Arabic)</Label>
          <Input
            id="lastNameAr"
            value={lastNameAr}
            onChange={(e) => setLastNameAr(e.target.value)}
            placeholder="دو"
            dir="rtl"
          />
        </div>
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
        <p className="text-sm text-muted-foreground mt-1">Optional contact email for the doctor.</p>
      </div>

      <div>
        <Label htmlFor="specialty">Specialty</Label>
        <Select value={specialtyId} onValueChange={setSpecialtyId}>
          <SelectTrigger id="specialty">
            <SelectValue placeholder="Select a specialty..." />
          </SelectTrigger>
          <SelectContent>
            {specialtiesData?.data?.map((specialty) => (
              <SelectItem key={specialty.id} value={String(specialty.id)}>
                {specialty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">Select the doctor's medical specialty.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="LIC123456"
          />
        </div>

        <div>
          <Label htmlFor="experienceYears">Experience (Years)</Label>
          <Input
            id="experienceYears"
            type="number"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="5"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main Street, City, Country"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="33.8547"
          />
        </div>

        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="35.8623"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            type="tel"
            placeholder="+96171123456"
          />
        </div>

        <div>
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="American University of Beirut"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio (English)</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Doctor's professional biography in English..."
        />
        <p className="text-sm text-muted-foreground mt-1">Maximum 2000 characters.</p>
      </div>

      <div>
        <Label htmlFor="bioAr">Bio (Arabic)</Label>
        <Textarea
          id="bioAr"
          value={bioAr}
          onChange={(e) => setBioAr(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="السيرة الذاتية المهنية للطبيب بالعربية..."
          dir="rtl"
        />
        <p className="text-sm text-muted-foreground mt-1">Maximum 2000 characters.</p>
      </div>

      <div>
        <Label htmlFor="avatar">Avatar Image</Label>
        <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
        {avatarPreview && (
          <div className="mt-2">
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-24 h-24 object-cover rounded-lg border border-border"
            />
          </div>
        )}
        {isEditMode && (
          <p className="text-sm text-muted-foreground mt-1">
            Leave empty to keep current avatar, or upload a new one to replace it.
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || (!isEditMode && (!username || !password || !phone || !firstName || !lastName)) || (isEditMode && (!phone || !firstName || !lastName))}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isEditMode ? 'Update Doctor' : 'Create Doctor Account'}
      </Button>
    </form>
  );
}
