import { useState } from "react";
import { useRoute } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDoctor } from "@/hooks/use-doctors";
import { useDoctorAnalytics, useDoctorProfileViews } from "@/hooks/use-doctor-analytics";
import { useOrganizations, useAddDoctorToClinic } from "@/hooks/use-organizations";
import { Loader2, ArrowLeft, User, Phone, Mail, MapPin, Calendar, Eye, Users, Star, CheckCircle, XCircle, Clock, Award, FileText, MessageCircle, Stethoscope, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function DoctorDetailPage() {
  const [match, params] = useRoute("/doctors/:doctorId");
  const doctorId = params?.doctorId || "";
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');

  const { data: doctor, isLoading: doctorLoading } = useDoctor(doctorId);
  const { data: analytics, isLoading: analyticsLoading } = useDoctorAnalytics(doctorId);
  const { data: profileViews, isLoading: viewsLoading } = useDoctorProfileViews(doctorId, 50);
  const { data: organizationsData } = useOrganizations({ status: 'approved' });
  const addToClinicMutation = useAddDoctorToClinic();

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

  if (doctorLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!doctor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Doctor not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const user = doctor.user || {};
  const isApproved = doctor.is_approved || doctor.isApproved;
  const isVip = doctor.is_vip || doctor.isVip;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Doctor Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name || "Doctor"} 
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl">{user.full_name || "N/A"}</CardTitle>
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
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{user.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.email || "N/A"}</span>
              </div>
              {doctor.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.address}</span>
                </div>
              )}
              {doctor.experience_years !== undefined && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{doctor.experience_years} years experience</span>
                </div>
              )}
            </div>
            {doctor.bio && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-muted-foreground">{doctor.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Cards */}
        {analyticsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : analytics && (
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

        {/* Add to Clinic Section */}
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

        {/* Recent Profile Views */}
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
      </div>
    </DashboardLayout>
  );
}

