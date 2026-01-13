import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSlidersAll, useCreateSlider, useUpdateSlider, useDeleteSlider } from "@/hooks/use-sliders";
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

export default function SlidersPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<any>(null);
  
  const { data: slidersData, isLoading } = useSlidersAll();
  const createMutation = useCreateSlider();
  const updateMutation = useUpdateSlider();
  const deleteMutation = useDeleteSlider();

  const filteredSliders = slidersData?.data?.filter(slider => 
    slider.title?.toLowerCase().includes(search.toLowerCase()) ||
    slider.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDelete = (sliderId: string) => {
    if (confirm("Are you sure you want to delete this slider?")) {
      deleteMutation.mutate(sliderId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Sliders</h1>
            <p className="text-muted-foreground mt-1">Manage homepage slider images and content.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add New Slider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Slider</DialogTitle>
              </DialogHeader>
              <SliderForm 
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
              placeholder="Search sliders..." 
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
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSliders.map((slider) => (
                  <TableRow key={slider.id} className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors">
                    <TableCell className="pl-6">
                      {slider.image_url ? (
                        <img 
                          src={slider.image_url} 
                          alt={slider.title} 
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{slider.title}</TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">
                      {slider.description || "No description"}
                    </TableCell>
                    <TableCell>{slider.display_order || 0}</TableCell>
                    <TableCell>
                      {slider.is_active || slider.isActive ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog key={slider.id}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingSlider(slider)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Slider</DialogTitle>
                            </DialogHeader>
                            <SliderForm 
                              key={slider.id}
                              slider={slider}
                              onSubmit={(data) => {
                                updateMutation.mutate({
                                  sliderId: String(slider.id),
                                  data: data
                                }, {
                                  onSuccess: () => setEditingSlider(null)
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
                          onClick={() => handleDelete(String(slider.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSliders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No sliders found.
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

function SliderForm({ 
  slider, 
  onSubmit, 
  isLoading 
}: { 
  slider?: any; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(slider?.title || "");
  const [titleAr, setTitleAr] = useState(slider?.title_ar || slider?.titleAr || "");
  const [description, setDescription] = useState(slider?.description || "");
  const [descriptionAr, setDescriptionAr] = useState(slider?.description_ar || slider?.descriptionAr || "");
  const [overlayColor, setOverlayColor] = useState(slider?.overlay_color || slider?.overlayColor || "#4A90E2");
  const [displayOrder, setDisplayOrder] = useState(slider?.display_order || slider?.displayOrder || 0);
  const [isActive, setIsActive] = useState(slider?.is_active !== undefined ? slider.is_active : (slider?.isActive !== undefined ? slider.isActive : true));
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Update form fields when slider prop changes
  useEffect(() => {
    if (slider) {
      setTitle(slider.title || "");
      setTitleAr(slider.title_ar || slider.titleAr || "");
      setDescription(slider.description || "");
      setDescriptionAr(slider.description_ar || slider.descriptionAr || "");
      setOverlayColor(slider.overlay_color || slider.overlayColor || "#4A90E2");
      setDisplayOrder(slider.display_order || slider.displayOrder || 0);
      setIsActive(slider.is_active !== undefined ? slider.is_active : (slider.isActive !== undefined ? slider.isActive : true));
      setImageFile(null); // Reset file input when switching between sliders
    } else {
      // Reset form for new slider
      setTitle("");
      setTitleAr("");
      setDescription("");
      setDescriptionAr("");
      setOverlayColor("#4A90E2");
      setDisplayOrder(0);
      setIsActive(true);
      setImageFile(null);
    }
  }, [slider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("title_ar", titleAr || ""); // Always send, even if empty
    formData.append("description", description);
    formData.append("description_ar", descriptionAr || ""); // Always send, even if empty
    formData.append("overlayColor", overlayColor);
    formData.append("displayOrder", String(displayOrder));
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
          maxLength={1000}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="descriptionAr">Description (Arabic)</Label>
        <Textarea 
          id="descriptionAr"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          maxLength={1000}
          rows={3}
          dir="rtl"
          placeholder="الوصف بالعربية"
        />
      </div>

      <div>
        <Label htmlFor="image">Image {!slider && "*"}</Label>
        <Input 
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          required={!slider}
        />
      </div>

      <div>
        <Label htmlFor="overlayColor">Overlay Color</Label>
        <div className="flex gap-2">
          <Input 
            id="overlayColor"
            type="color"
            value={overlayColor}
            onChange={(e) => setOverlayColor(e.target.value)}
            className="w-20 h-10"
          />
          <Input 
            value={overlayColor}
            onChange={(e) => setOverlayColor(e.target.value)}
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input 
          id="displayOrder"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          min={0}
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
        {slider ? "Update Slider" : "Create Slider"}
      </Button>
    </form>
  );
}

