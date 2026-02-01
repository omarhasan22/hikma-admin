import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDoctor, useUpdateDoctor, useCreateDoctor } from "@/hooks/use-doctors";
import { useDoctorAnalytics, useDoctorProfileViews } from "@/hooks/use-doctor-analytics";
import { useOrganizations, useAddDoctorToClinic } from "@/hooks/use-organizations";
import { useAddClinicDoctorService, useUpdateClinicDoctorService, useDeleteClinicDoctorService } from "@/hooks/use-clinic-doctor-services";
import { useSetClinicWorkingHours, useUpdateClinicWorkingHours, useDeleteClinicWorkingHours } from "@/hooks/use-clinic-working-hours";
import { useUpdateClinicDoctorSettings } from "@/hooks/use-clinic-doctor-settings";
import { useServices } from "@/hooks/use-services";
import { Loader2, ArrowLeft, User, Phone, Mail, MapPin, Calendar, Eye, Users, Star, CheckCircle, XCircle, Clock, Award, FileText, MessageCircle, Stethoscope, Globe, Building2, Edit, Briefcase, Clock as ClockIcon, Save, X, Upload, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function DoctorDetailPage() {
  const [matchNew, paramsNew] = useRoute("/doctors/new");
  const [matchDetail, paramsDetail] = useRoute("/doctors/:doctorId");
  const [location, setLocation] = useLocation();
  const isCreateMode = !!matchNew;
  const doctorId = isCreateMode ? "new" : (paramsDetail?.doctorId || "");
  
  // Check for edit query parameter in URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const shouldStartInEditMode = searchParams.get('edit') === 'true';
  
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [isEditMode, setIsEditMode] = useState(isCreateMode || shouldStartInEditMode); // Start in edit mode for create or if ?edit=true

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [firstNameAr, setFirstNameAr] = useState('');
  const [lastName, setLastName] = useState('');
  const [lastNameAr, setLastNameAr] = useState('');
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

  const { data: doctor, isLoading: doctorLoading } = useDoctor(isCreateMode ? "" : doctorId);
  const { data: analytics, isLoading: analyticsLoading } = useDoctorAnalytics(isCreateMode ? "" : doctorId);
  const { data: profileViews, isLoading: viewsLoading } = useDoctorProfileViews(isCreateMode ? "" : doctorId, 50);
  const { data: organizationsData } = useOrganizations({ status: 'approved' });
  const { data: specialtiesData } = useServices();
  const addToClinicMutation = useAddDoctorToClinic();
  const updateMutation = useUpdateDoctor();
  const createMutation = useCreateDoctor();
  
  // Clinic editing state
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingWorkingHoursDay, setEditingWorkingHoursDay] = useState<string | null>(null);
  const [newService, setNewService] = useState<{ name: string; nameAr: string; price: string; durationMinutes: string } | null>(null);
  const [newWorkingHours, setNewWorkingHours] = useState<{ dayOfWeek: string; startTime: string; endTime: string; breakStart: string; breakEnd: string; isActive: boolean } | null>(null);
  
  // Clinic form state (per clinic)
  const [clinicFormData, setClinicFormData] = useState<Record<string, { defaultSlotDuration: string; maxBookingDays: string; isPrimary: boolean; role: string }>>({});
  
  // Service form state (per service)
  const [serviceFormData, setServiceFormData] = useState<Record<string, { name: string; nameAr: string; price: string; durationMinutes: string }>>({});
  
  // Working hours form state (per day)
  const [workingHoursFormData, setWorkingHoursFormData] = useState<Record<string, { startTime: string; endTime: string; breakStart: string; breakEnd: string; isActive: boolean }>>({});
  
  // Mutations
  const addServiceMutation = useAddClinicDoctorService();
  const updateServiceMutation = useUpdateClinicDoctorService();
  const deleteServiceMutation = useDeleteClinicDoctorService();
  const setWorkingHoursMutation = useSetClinicWorkingHours();
  const updateWorkingHoursMutation = useUpdateClinicWorkingHours();
  const deleteWorkingHoursMutation = useDeleteClinicWorkingHours();
  const updateSettingsMutation = useUpdateClinicDoctorSettings();

  // Initialize form fields from doctor data
  useEffect(() => {
    if (isCreateMode) {
      // Reset all fields for create mode
      setUsername('');
      setPassword('');
      setPhone('');
      setEmail('');
      setFirstName('');
      setFirstNameAr('');
      setLastName('');
      setLastNameAr('');
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
    } else if (doctor && !isEditMode) {
      const user = doctor.user || {};
      const specialty = doctor.specialty || {};
      
      setPhone(user.phone || doctor.phone || '');
      setEmail(user.email || doctor.email || '');
      setFirstName(user.first_name || doctor.first_name || '');
      setFirstNameAr(user.first_name_ar || doctor.first_name_ar || '');
      setLastName(user.last_name || doctor.last_name || '');
      setLastNameAr(user.last_name_ar || doctor.last_name_ar || '');
      setBio(user.bio || doctor.bio || '');
      setBioAr(user.bio_ar || doctor.bio_ar || '');
      setSpecialtyId(String(doctor.specialty_id || specialty.id || doctor.specialtyId || ''));
      setLicenseNumber(doctor.license_number || doctor.licenseNumber || '');
      setExperienceYears(
        doctor.experience_years !== null && doctor.experience_years !== undefined
          ? String(doctor.experience_years)
          : doctor.experienceYears !== null && doctor.experienceYears !== undefined
          ? String(doctor.experienceYears)
          : ''
      );
      setAddress(doctor.address || '');
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
      setAvatarFile(null);
    }
  }, [doctor, isEditMode]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (isCreateMode) {
      // Create mode - use FormData with username and password
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('phone', phone);
      if (email) formData.append('email', email);
      formData.append('firstName', firstName);
      if (firstNameAr) formData.append('firstNameAr', firstNameAr);
      formData.append('lastName', lastName);
      if (lastNameAr) formData.append('lastNameAr', lastNameAr);
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

      createMutation.mutate(formData, {
        onSuccess: (newDoctor) => {
          // Redirect to the new doctor's detail page
          setLocation(`/doctors/${newDoctor.id}`);
        },
      });
    } else {
      // Update mode
      const formData = new FormData();
      
      // User fields
      if (phone) formData.append('phone', phone);
      if (email) formData.append('email', email);
      if (firstName) formData.append('first_name', firstName);
      if (firstNameAr) formData.append('first_name_ar', firstNameAr);
      if (lastName) formData.append('last_name', lastName);
      if (lastNameAr) formData.append('last_name_ar', lastNameAr);
      if (bio) formData.append('bio', bio);
      if (bioAr) formData.append('bio_ar', bioAr);
      
      // Doctor fields
      if (specialtyId) formData.append('specialty_id', specialtyId);
      if (licenseNumber) formData.append('license_number', licenseNumber);
      if (experienceYears) formData.append('experience_years', experienceYears);
      if (address) formData.append('address', address);
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (whatsapp) formData.append('whatsapp', whatsapp);
      if (university) formData.append('university', university);
      
      // Avatar
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      updateMutation.mutate(
        { doctorId, data: formData },
        {
          onSuccess: () => {
            setIsEditMode(false);
          },
        }
      );
    }
  };

  const handleCancel = () => {
    if (isCreateMode) {
      // For create mode, navigate back to doctors list
      setLocation("/doctors");
    } else {
      // Reset form to original values
      if (doctor) {
      const user = doctor.user || {};
      const specialty = doctor.specialty || {};
      
      setPhone(user.phone || doctor.phone || '');
      setEmail(user.email || doctor.email || '');
      setFirstName(user.first_name || doctor.first_name || '');
      setFirstNameAr(user.first_name_ar || doctor.first_name_ar || '');
      setLastName(user.last_name || doctor.last_name || '');
      setLastNameAr(user.last_name_ar || doctor.last_name_ar || '');
      setBio(user.bio || doctor.bio || '');
      setBioAr(user.bio_ar || doctor.bio_ar || '');
      setSpecialtyId(String(doctor.specialty_id || specialty.id || doctor.specialtyId || ''));
      setLicenseNumber(doctor.license_number || doctor.licenseNumber || '');
      setExperienceYears(
        doctor.experience_years !== null && doctor.experience_years !== undefined
          ? String(doctor.experience_years)
          : ''
      );
      setAddress(doctor.address || '');
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
      setAvatarFile(null);
      }
      setIsEditMode(false);
    }
  };

  const handleAddToClinic = () => {
    if (doctorId && selectedClinicId) {
      addToClinicMutation.mutate(
        { clinicId: selectedClinicId, doctorId, role: selectedRole },
        {
          onSuccess: () => {
            setSelectedClinicId("");
            setSelectedRole('member');
          },
        }
      );
    }
  };

  if (!isCreateMode && doctorLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isCreateMode && !doctor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Doctor not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const user = doctor?.user || {};
  const isApproved = doctor?.is_approved || doctor?.isApproved;
  const isVip = doctor?.is_vip || doctor?.isVip;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/doctors")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {isCreateMode && (
              <h1 className="text-3xl font-display font-bold text-foreground">Create New Doctor</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isCreateMode ? createMutation.isPending : updateMutation.isPending}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isCreateMode ? createMutation.isPending : updateMutation.isPending}
                  className="gap-2"
                >
                  {(isCreateMode ? createMutation.isPending : updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isCreateMode ? "Create Doctor" : "Save Changes"}
                </Button>
              </>
            ) : (
              !isCreateMode && (
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Doctor
                </Button>
              )
            )}
          </div>
        </div>

        {/* Header Section with Avatar */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {isEditMode ? (
                    <div className="relative">
                      <img 
                        src={avatarPreview || user.avatar_url || ""} 
                        alt={user.full_name || "Doctor"} 
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                      />
                      <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name || "Doctor"} 
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                        <User className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )
                  )}
                </div>
                <div>
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="firstName">First Name (EN) *</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name (EN) *</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="firstNameAr">First Name (AR)</Label>
                          <Input
                            id="firstNameAr"
                            value={firstNameAr}
                            onChange={(e) => setFirstNameAr(e.target.value)}
                            className="mt-1"
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastNameAr">Last Name (AR)</Label>
                          <Input
                            id="lastNameAr"
                            value={lastNameAr}
                            onChange={(e) => setLastNameAr(e.target.value)}
                            className="mt-1"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-3xl">{user.full_name || `${firstName} ${lastName}` || "N/A"}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {isApproved ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                            <CheckCircle className="w-3 h-3 mr-1" /> Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        )}
                        {isVip && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                            <Star className="w-3 h-3 mr-1 fill-amber-600" /> VIP
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isCreateMode && isEditMode && (
                <>
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
                      className="mt-1"
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
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum 6 characters. Share securely with the doctor.
                    </p>
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="phone">Phone {isCreateMode && isEditMode && "*"}</Label>
                {isEditMode ? (
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                    required={isCreateMode}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{phone || "N/A"}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditMode ? (
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{email || "N/A"}</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                {isEditMode ? (
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{address || "N/A"}</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio">Bio (English)</Label>
                {isEditMode ? (
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground mt-1">{bio || "No bio provided"}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bioAr">Bio (Arabic)</Label>
                {isEditMode ? (
                  <Textarea
                    id="bioAr"
                    value={bioAr}
                    onChange={(e) => setBioAr(e.target.value)}
                    className="mt-1"
                    rows={4}
                    dir="rtl"
                  />
                ) : (
                  <p className="text-muted-foreground mt-1" dir="rtl">{bioAr || "لا يوجد سيرة ذاتية"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                {isEditMode ? (
                  <Select value={specialtyId} onValueChange={setSpecialtyId}>
                    <SelectTrigger id="specialty" className="mt-1">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialtiesData?.data?.map((spec: any) => (
                        <SelectItem key={spec.id} value={spec.id}>
                          {spec.name || spec.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Stethoscope className="w-4 h-4" />
                    <span>{doctor.specialty?.name || "N/A"}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                {isEditMode ? (
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Award className="w-4 h-4" />
                    <span>{licenseNumber || "N/A"}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="university">University</Label>
                {isEditMode ? (
                  <Input
                    id="university"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Globe className="w-4 h-4" />
                    <span>{university || "N/A"}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="experienceYears">Experience (Years)</Label>
                {isEditMode ? (
                  <Input
                    id="experienceYears"
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{experienceYears ? `${experienceYears} years` : "N/A"}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                {isEditMode ? (
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{whatsapp || "N/A"}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                {isEditMode ? (
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="text-muted-foreground mt-1">{latitude || "N/A"}</div>
                )}
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                {isEditMode ? (
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="text-muted-foreground mt-1">{longitude || "N/A"}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cards */}
        {!isCreateMode && analyticsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !isCreateMode && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Appointments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.appointments.total}</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-emerald-600">{analytics.appointments.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmed</span>
                    <span className="font-medium text-blue-600">{analytics.appointments.confirmed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium text-amber-600">{analytics.appointments.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cancelled</span>
                    <span className="font-medium text-red-600">{analytics.appointments.cancelled}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Views */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profile Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.profileViews.total}</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unique Visitors</span>
                    <span className="font-medium">{analytics.profileViews.unique}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Today</span>
                    <span className="font-medium">{analytics.profileViews.today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-medium">{analytics.profileViews.thisWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-medium">{analytics.profileViews.thisMonth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <div className="text-3xl font-bold">{analytics.reviews.average.toFixed(1)}</div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {analytics.reviews.total} total reviews
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <div className="text-3xl font-bold">{doctor.rating_average || doctor.rating || "0.0"}</div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {doctor.rating_count || doctor.reviewCount || 0} ratings
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clinics Section */}
        {!isCreateMode && doctor?.clinic_doctors && doctor.clinic_doctors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Clinics ({doctor.clinic_doctors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {doctor.clinic_doctors.map((clinicDoctor: any) => {
                  const clinic = clinicDoctor.clinic || {};
                  const services = clinicDoctor.clinic_services || [];
                  const workingHours = clinicDoctor.working_hours || [];
                  const clinicId = clinic.id;
                  const isEditingClinic = editingClinicId === clinicId;
                  
                  const dayNames: { [key: string]: string } = {
                    monday: 'Monday',
                    tuesday: 'Tuesday',
                    wednesday: 'Wednesday',
                    thursday: 'Thursday',
                    friday: 'Friday',
                    saturday: 'Saturday',
                    sunday: 'Sunday'
                  };

                  const clinicForm = clinicFormData[clinicId] || {
                    defaultSlotDuration: String(clinicDoctor.default_slot_duration || 30),
                    maxBookingDays: String(clinicDoctor.max_booking_days || ''),
                    isPrimary: clinicDoctor.is_primary || false,
                    role: clinicDoctor.role || 'member'
                  };

                  const handleSaveClinicSettings = () => {
                    updateSettingsMutation.mutate({
                      doctorId,
                      clinicId,
                      data: {
                        defaultSlotDuration: parseInt(clinicForm.defaultSlotDuration),
                        maxBookingDays: clinicForm.maxBookingDays ? parseInt(clinicForm.maxBookingDays) : undefined,
                        isPrimary: clinicForm.isPrimary,
                        role: clinicForm.role
                      }
                    }, {
                      onSuccess: () => {
                        setEditingClinicId(null);
                        setClinicFormData({});
                      }
                    });
                  };

                  const handleCancelClinicEdit = () => {
                    setEditingClinicId(null);
                    setClinicFormData({});
                    setEditingServiceId(null);
                    setEditingWorkingHoursDay(null);
                    setNewService(null);
                    setNewWorkingHours(null);
                  };

                  const handleAddService = () => {
                    if (!newService?.name || !newService?.price || !newService?.durationMinutes) return;
                    addServiceMutation.mutate({
                      doctorId,
                      clinicId,
                      data: {
                        name: newService.name,
                        nameAr: newService.nameAr || undefined,
                        price: parseFloat(newService.price),
                        durationMinutes: parseInt(newService.durationMinutes)
                      }
                    }, {
                      onSuccess: () => {
                        setNewService(null);
                      }
                    });
                  };

                  const handleUpdateService = (serviceId: string) => {
                    const form = serviceFormData[serviceId];
                    if (!form) return;
                    updateServiceMutation.mutate({
                      doctorId,
                      clinicId,
                      serviceId,
                      data: {
                        name: form.name,
                        nameAr: form.nameAr || undefined,
                        price: parseFloat(form.price),
                        durationMinutes: parseInt(form.durationMinutes)
                      }
                    }, {
                      onSuccess: () => {
                        setEditingServiceId(null);
                        setServiceFormData({});
                      }
                    });
                  };

                  const handleDeleteService = (serviceId: string) => {
                    if (confirm('Are you sure you want to delete this service?')) {
                      deleteServiceMutation.mutate({ doctorId, clinicId, serviceId });
                    }
                  };

                  const handleSaveWorkingHours = (dayOfWeek: string) => {
                    const form = workingHoursFormData[dayOfWeek];
                    if (!form) return;
                    updateWorkingHoursMutation.mutate({
                      doctorId,
                      clinicId,
                      dayOfWeek,
                      data: {
                        startTime: form.startTime,
                        endTime: form.endTime,
                        breakStart: form.breakStart || null,
                        breakEnd: form.breakEnd || null,
                        isActive: form.isActive
                      }
                    }, {
                      onSuccess: () => {
                        setEditingWorkingHoursDay(null);
                        setWorkingHoursFormData({});
                      }
                    });
                  };

                  const handleAddWorkingHours = () => {
                    if (!newWorkingHours?.dayOfWeek || !newWorkingHours?.startTime || !newWorkingHours?.endTime) return;
                    setWorkingHoursMutation.mutate({
                      doctorId,
                      clinicId,
                      data: {
                        dayOfWeek: newWorkingHours.dayOfWeek,
                        startTime: newWorkingHours.startTime,
                        endTime: newWorkingHours.endTime,
                        breakStart: newWorkingHours.breakStart || null,
                        breakEnd: newWorkingHours.breakEnd || null,
                        isActive: newWorkingHours.isActive
                      }
                    }, {
                      onSuccess: () => {
                        setNewWorkingHours(null);
                      }
                    });
                  };

                  const handleDeleteWorkingHours = (dayOfWeek: string) => {
                    if (confirm('Are you sure you want to delete working hours for this day?')) {
                      deleteWorkingHoursMutation.mutate({ doctorId, clinicId, dayOfWeek });
                    }
                  };

                  return (
                    <div key={clinicDoctor.id} className="border rounded-lg p-4 space-y-4">
                      {/* Clinic Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{clinic.name || 'Unnamed Clinic'}</h3>
                            {clinicDoctor.is_primary && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                Primary
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {clinicDoctor.role || 'member'}
                            </Badge>
                          </div>
                          {clinic.address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <MapPin className="w-4 h-4" />
                              <span>{clinic.address}</span>
                            </div>
                          )}
                          {clinic.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{clinic.phone}</span>
                            </div>
                          )}
                          {isEditingClinic ? (
                            <div className="mt-4 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Slot Duration (min)</Label>
                                  <Input
                                    type="number"
                                    value={clinicForm.defaultSlotDuration}
                                    onChange={(e) => setClinicFormData({
                                      ...clinicFormData,
                                      [clinicId]: { ...clinicForm, defaultSlotDuration: e.target.value }
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Max Booking Days</Label>
                                  <Input
                                    type="number"
                                    value={clinicForm.maxBookingDays}
                                    onChange={(e) => setClinicFormData({
                                      ...clinicFormData,
                                      [clinicId]: { ...clinicForm, maxBookingDays: e.target.value }
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Role</Label>
                                  <Select
                                    value={clinicForm.role}
                                    onValueChange={(value) => setClinicFormData({
                                      ...clinicFormData,
                                      [clinicId]: { ...clinicForm, role: value }
                                    })}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="owner">Owner</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="doctor">Doctor</SelectItem>
                                      <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                  <input
                                    type="checkbox"
                                    id={`primary-${clinicId}`}
                                    checked={clinicForm.isPrimary}
                                    onChange={(e) => setClinicFormData({
                                      ...clinicFormData,
                                      [clinicId]: { ...clinicForm, isPrimary: e.target.checked }
                                    })}
                                  />
                                  <Label htmlFor={`primary-${clinicId}`}>Primary Clinic</Label>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveClinicSettings}
                                  disabled={updateSettingsMutation.isPending}
                                >
                                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Save Settings
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelClinicEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span>Slot Duration: {clinicDoctor.default_slot_duration || 30} min</span>
                              {clinicDoctor.max_booking_days && (
                                <span className="ml-4">Max Booking: {clinicDoctor.max_booking_days} days</span>
                              )}
                            </div>
                          )}
                        </div>
                        {!isEditingClinic && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingClinicId(clinicId)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>

                      {/* Services */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Services ({services.length})
                          </h4>
                          {isEditingClinic && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setNewService({ name: '', nameAr: '', price: '', durationMinutes: '' })}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Service
                            </Button>
                          )}
                        </div>
                        {newService && (
                          <div className="border rounded p-3 mb-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Service Name"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                              />
                              <Input
                                placeholder="Service Name (AR)"
                                value={newService.nameAr}
                                onChange={(e) => setNewService({ ...newService, nameAr: e.target.value })}
                                dir="rtl"
                              />
                              <Input
                                type="number"
                                placeholder="Price"
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                              />
                              <Input
                                type="number"
                                placeholder="Duration (minutes)"
                                value={newService.durationMinutes}
                                onChange={(e) => setNewService({ ...newService, durationMinutes: e.target.value })}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleAddService} disabled={addServiceMutation.isPending}>
                                {addServiceMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setNewService(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        {services.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {services.map((service: any) => {
                              const isEditing = editingServiceId === service.id;
                              const form = serviceFormData[service.id] || {
                                name: service.name || '',
                                nameAr: service.name_ar || '',
                                price: String(service.price || 0),
                                durationMinutes: String(service.duration_minutes || 30)
                              };
                              return (
                                <div key={service.id} className="border rounded p-2 text-sm relative">
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={form.name}
                                        onChange={(e) => setServiceFormData({
                                          ...serviceFormData,
                                          [service.id]: { ...form, name: e.target.value }
                                        })}
                                      />
                                      <Input
                                        value={form.nameAr}
                                        onChange={(e) => setServiceFormData({
                                          ...serviceFormData,
                                          [service.id]: { ...form, nameAr: e.target.value }
                                        })}
                                        dir="rtl"
                                      />
                                      <div className="grid grid-cols-2 gap-1">
                                        <Input
                                          type="number"
                                          value={form.price}
                                          onChange={(e) => setServiceFormData({
                                            ...serviceFormData,
                                            [service.id]: { ...form, price: e.target.value }
                                          })}
                                        />
                                        <Input
                                          type="number"
                                          value={form.durationMinutes}
                                          onChange={(e) => setServiceFormData({
                                            ...serviceFormData,
                                            [service.id]: { ...form, durationMinutes: e.target.value }
                                          })}
                                        />
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          className="h-6 text-xs"
                                          onClick={() => handleUpdateService(service.id)}
                                          disabled={updateServiceMutation.isPending}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-xs"
                                          onClick={() => {
                                            setEditingServiceId(null);
                                            setServiceFormData({});
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="font-medium">{service.name || service.name_ar}</div>
                                      <div className="text-muted-foreground">
                                        ${service.price?.toFixed(2) || '0.00'} • {service.duration_minutes || 30} min
                                      </div>
                                      {isEditingClinic && (
                                        <div className="absolute top-1 right-1 flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() => setEditingServiceId(service.id)}
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 text-destructive"
                                            onClick={() => handleDeleteService(service.id)}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No services configured</p>
                        )}
                      </div>

                      {/* Working Hours */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            Working Hours
                          </h4>
                          {isEditingClinic && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setNewWorkingHours({ dayOfWeek: '', startTime: '', endTime: '', breakStart: '', breakEnd: '', isActive: true })}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Working Hours
                            </Button>
                          )}
                        </div>
                        {newWorkingHours && (
                          <div className="border rounded p-3 mb-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Day</Label>
                                <Select
                                  value={newWorkingHours.dayOfWeek}
                                  onValueChange={(value) => setNewWorkingHours({ ...newWorkingHours, dayOfWeek: value })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(dayNames).map(([key, name]) => (
                                      <SelectItem key={key} value={key}>{name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-2 mt-6">
                                <input
                                  type="checkbox"
                                  checked={newWorkingHours.isActive}
                                  onChange={(e) => setNewWorkingHours({ ...newWorkingHours, isActive: e.target.checked })}
                                />
                                <Label>Active</Label>
                              </div>
                              <div>
                                <Label>Start Time</Label>
                                <Input
                                  type="time"
                                  value={newWorkingHours.startTime}
                                  onChange={(e) => setNewWorkingHours({ ...newWorkingHours, startTime: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>End Time</Label>
                                <Input
                                  type="time"
                                  value={newWorkingHours.endTime}
                                  onChange={(e) => setNewWorkingHours({ ...newWorkingHours, endTime: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Break Start (optional)</Label>
                                <Input
                                  type="time"
                                  value={newWorkingHours.breakStart}
                                  onChange={(e) => setNewWorkingHours({ ...newWorkingHours, breakStart: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Break End (optional)</Label>
                                <Input
                                  type="time"
                                  value={newWorkingHours.breakEnd}
                                  onChange={(e) => setNewWorkingHours({ ...newWorkingHours, breakEnd: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleAddWorkingHours} disabled={setWorkingHoursMutation.isPending}>
                                {setWorkingHoursMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setNewWorkingHours(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        {workingHours.length > 0 ? (
                          <div className="space-y-1">
                            {workingHours
                              .sort((a: any, b: any) => {
                                const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                return order.indexOf(a.day_of_week) - order.indexOf(b.day_of_week);
                              })
                              .map((wh: any) => {
                                const isEditing = editingWorkingHoursDay === wh.day_of_week;
                                const form = workingHoursFormData[wh.day_of_week] || {
                                  startTime: wh.start_time || '',
                                  endTime: wh.end_time || '',
                                  breakStart: wh.break_start || '',
                                  breakEnd: wh.break_end || '',
                                  isActive: wh.is_active !== false
                                };
                                return (
                                  <div key={wh.id} className="flex items-center justify-between text-sm border rounded p-2 relative">
                                    {isEditing ? (
                                      <div className="flex-1 grid grid-cols-5 gap-2 items-center">
                                        <span className="font-medium">{dayNames[wh.day_of_week] || wh.day_of_week}</span>
                                        <Input
                                          type="time"
                                          value={form.startTime}
                                          onChange={(e) => setWorkingHoursFormData({
                                            ...workingHoursFormData,
                                            [wh.day_of_week]: { ...form, startTime: e.target.value }
                                          })}
                                        />
                                        <Input
                                          type="time"
                                          value={form.endTime}
                                          onChange={(e) => setWorkingHoursFormData({
                                            ...workingHoursFormData,
                                            [wh.day_of_week]: { ...form, endTime: e.target.value }
                                          })}
                                        />
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="checkbox"
                                            checked={form.isActive}
                                            onChange={(e) => setWorkingHoursFormData({
                                              ...workingHoursFormData,
                                              [wh.day_of_week]: { ...form, isActive: e.target.checked }
                                            })}
                                          />
                                          <span className="text-xs">Active</span>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => handleSaveWorkingHours(wh.day_of_week)}
                                            disabled={updateWorkingHoursMutation.isPending}
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 text-xs"
                                            onClick={() => {
                                              setEditingWorkingHoursDay(null);
                                              setWorkingHoursFormData({});
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="font-medium">{dayNames[wh.day_of_week] || wh.day_of_week}</span>
                                        <div className="flex items-center gap-2">
                                          {wh.is_active ? (
                                            <>
                                              <span>{wh.start_time} - {wh.end_time}</span>
                                              {wh.break_start && wh.break_end && (
                                                <span className="text-muted-foreground">
                                                  (Break: {wh.break_start} - {wh.break_end})
                                                </span>
                                              )}
                                            </>
                                          ) : (
                                            <span className="text-muted-foreground italic">Inactive</span>
                                          )}
                                        </div>
                                        {isEditingClinic && (
                                          <div className="absolute top-1 right-1 flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 w-6 p-0"
                                              onClick={() => setEditingWorkingHoursDay(wh.day_of_week)}
                                            >
                                              <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 w-6 p-0 text-destructive"
                                              onClick={() => handleDeleteWorkingHours(wh.day_of_week)}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No working hours configured</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add to Clinic Section */}
        {!isCreateMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Add Doctor to Clinic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clinic-select">Select Clinic</Label>
                <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                  <SelectTrigger id="clinic-select" className="mt-2">
                    <SelectValue placeholder="Choose a clinic to add doctor to..." />
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
                <Select value={selectedRole} onValueChange={(value: 'admin' | 'member') => setSelectedRole(value)}>
                  <SelectTrigger id="role-select" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Member: Regular clinic member. Admin: Can manage clinic settings and members.
                </p>
              </div>
              <Button
                onClick={handleAddToClinic}
                disabled={!selectedClinicId || addToClinicMutation.isPending}
                className="w-full"
              >
                {addToClinicMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Doctor to Clinic
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Recent Profile Views */}
        {!isCreateMode && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            {viewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : profileViews && profileViews.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Viewer</TableHead>
                    <TableHead>Viewed At</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profileViews.map((view) => (
                    <TableRow key={view.id}>
                      <TableCell>
                        {view.viewer ? (
                          <div className="flex items-center gap-2">
                            {view.viewer.avatar_url && (
                              <img 
                                src={view.viewer.avatar_url} 
                                alt={view.viewer.full_name || "User"} 
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <div className="font-medium">{view.viewer.full_name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">{view.viewer.user_type}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Anonymous</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(view.viewed_at), "PPp")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {view.ip_address || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No profile views yet</p>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

