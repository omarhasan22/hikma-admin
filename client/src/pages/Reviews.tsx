import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useReviews, useUpdateReviewVisibility } from "@/hooks/use-reviews";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Eye, EyeOff, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function ReviewsPage() {
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  
  const { data: reviewsData, isLoading } = useReviews({
    doctorId: doctorFilter || undefined
  });
  const updateVisibilityMutation = useUpdateReviewVisibility();

  const filteredReviews = reviewsData?.data?.filter(review => 
    review.comment?.toLowerCase().includes(search.toLowerCase()) ||
    review.patient?.full_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleToggleVisibility = (reviewId: string, currentVisibility: boolean) => {
    updateVisibilityMutation.mutate({
      reviewId,
      isVisible: !currentVisibility
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Reviews</h1>
            <p className="text-muted-foreground mt-1">Manage patient reviews and their visibility.</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search reviews..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-border focus:ring-primary/20"
            />
          </div>

          <div className="relative w-full md:w-72">
            <Input 
              placeholder="Filter by Doctor ID (optional)" 
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="h-10 rounded-xl bg-background border-border focus:ring-primary/20"
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
                  <TableHead className="pl-6">Patient</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => {
                  const isVisible = review.is_visible !== undefined ? review.is_visible : (review.isVisible !== undefined ? review.isVisible : true);
                  return (
                    <TableRow key={review.id} className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors">
                      <TableCell className="font-medium pl-6">
                        {review.patient?.full_name || review.patient?.fullName || "Anonymous"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{review.rating || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-md truncate">
                        {review.comment || "No comment"}
                      </TableCell>
                      <TableCell>
                        {review.created_at || review.createdAt 
                          ? new Date(review.created_at || review.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {isVisible ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                            <Eye className="w-3 h-3 mr-1" /> Visible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                            <EyeOff className="w-3 h-3 mr-1" /> Hidden
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={isVisible}
                            onCheckedChange={() => handleToggleVisibility(String(review.id), isVisible)}
                            disabled={updateVisibilityMutation.isPending}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredReviews.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No reviews found.
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

