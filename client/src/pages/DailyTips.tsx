import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDailyTipsAll, useCreateDailyTip, useUpdateDailyTip, useDeleteDailyTip } from "@/hooks/use-daily-tips";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function DailyTipsPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<any>(null);
  
  const { data: tipsData, isLoading } = useDailyTipsAll();
  const createMutation = useCreateDailyTip();
  const updateMutation = useUpdateDailyTip();
  const deleteMutation = useDeleteDailyTip();

  const filteredTips = tipsData?.data?.filter(tip => 
    tip.title?.toLowerCase().includes(search.toLowerCase()) ||
    tip.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDelete = (tipId: string) => {
    if (confirm("Are you sure you want to delete this daily tip?")) {
      deleteMutation.mutate(tipId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Daily Tips</h1>
            <p className="text-muted-foreground mt-1">Manage daily health tips displayed to users.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add New Tip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Daily Tip</DialogTitle>
              </DialogHeader>
              <TipForm 
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

        {/* Search */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative w-full md:w-72">
            <Input 
              placeholder="Search tips..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                  <TableHead className="w-[200px] pl-6">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTips.map((tip) => (
                  <TableRow key={tip.id} className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors">
                    <TableCell className="pl-6">
                      {tip.image || tip.image_url ? (
                        <img 
                          src={tip.image || tip.image_url} 
                          alt={tip.title} 
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{tip.title}</TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">
                      {tip.description || "No description"}
                    </TableCell>
                    <TableCell>
                      {tip.is_active || tip.isActive ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {tip.created_at ? new Date(tip.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog key={tip.id}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingTip(tip)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Daily Tip</DialogTitle>
                            </DialogHeader>
                            <TipForm 
                              key={tip.id}
                              tip={tip}
                              onSubmit={(data) => {
                                updateMutation.mutate({
                                  tipId: String(tip.id),
                                  data: data
                                }, {
                                  onSuccess: () => setEditingTip(null)
                                });
                              }}
                              isLoading={updateMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(String(tip.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No daily tips found.
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

function TipForm({ 
  tip, 
  onSubmit, 
  isLoading 
}: { 
  tip?: any; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(tip?.title || "");
  const [titleAr, setTitleAr] = useState(tip?.title_ar || tip?.titleAr || "");
  const [description, setDescription] = useState(tip?.description || "");
  const [descriptionAr, setDescriptionAr] = useState(tip?.description_ar || tip?.descriptionAr || "");
  const [isActive, setIsActive] = useState(tip?.is_active !== undefined ? tip.is_active : (tip?.isActive !== undefined ? tip.isActive : false));
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Update form fields when tip prop changes
  useEffect(() => {
    if (tip) {
      setTitle(tip.title || "");
      setTitleAr(tip.title_ar || tip.titleAr || "");
      setDescription(tip.description || "");
      setDescriptionAr(tip.description_ar || tip.descriptionAr || "");
      setIsActive(tip.is_active !== undefined ? tip.is_active : (tip.isActive !== undefined ? tip.isActive : false));
      setImageFile(null); // Reset file input when switching between tips
    } else {
      // Reset form for new tip
      setTitle("");
      setTitleAr("");
      setDescription("");
      setDescriptionAr("");
      setIsActive(false);
      setImageFile(null);
    }
  }, [tip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("title_ar", titleAr || ""); // Always send, even if empty
    formData.append("description", description);
    formData.append("description_ar", descriptionAr || ""); // Always send, even if empty
    formData.append("isActive", String(isActive));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="title">Title (English) *</Label>
        <Input 
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div>
        <Label htmlFor="titleAr">Title (Arabic)</Label>
        <Input 
          id="titleAr"
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
          maxLength={200}
          dir="rtl"
          placeholder="العنوان بالعربية"
        />
      </div>

      <div>
        <Label htmlFor="description">Description (English)</Label>
        <Textarea 
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="descriptionAr">Description (Arabic)</Label>
        <Textarea 
          id="descriptionAr"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          maxLength={2000}
          rows={4}
          dir="rtl"
          placeholder="الوصف بالعربية"
        />
      </div>

      <div>
        <Label htmlFor="image">Image {!tip && "(optional)"}</Label>
        <Input 
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Active</Label>
        <Switch 
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {tip ? "Update Tip" : "Create Tip"}
      </Button>
    </form>
  );
}

