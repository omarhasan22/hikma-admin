import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/use-services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, ImageIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function SpecialtiesPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const { data: servicesData, isLoading } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const filteredServices = servicesData?.data?.filter(service => 
    service.name?.toLowerCase().includes(search.toLowerCase()) ||
    service.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDelete = (serviceId: string) => {
    if (confirm("Are you sure you want to delete this specialty?")) {
      deleteMutation.mutate(serviceId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Specialties</h1>
            <p className="text-muted-foreground mt-1">Manage medical specialties available for doctors.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add New Specialty
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Specialty</DialogTitle>
              </DialogHeader>
              <SpecialtyForm 
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
              placeholder="Search specialties..." 
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
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors">
                    <TableCell className="font-medium pl-6">{service.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">
                      {service.description || "No description"}
                    </TableCell>
                    <TableCell>
                      {service.is_active !== false && service.isActive !== false ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog key={service.id}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingService(service)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Specialty</DialogTitle>
                            </DialogHeader>
                            <SpecialtyForm 
                              key={service.id}
                              service={service}
                              onSubmit={(data) => {
                                updateMutation.mutate({
                                  serviceId: String(service.id),
                                  data: data
                                }, {
                                  onSuccess: () => {
                                    setEditingService(null);
                                  }
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
                          onClick={() => handleDelete(String(service.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredServices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No specialties found.
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

function SpecialtyForm({ 
  service, 
  onSubmit, 
  isLoading 
}: { 
  service?: any; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [name, setName] = useState(service?.name || "");
  const [nameAr, setNameAr] = useState(service?.name_ar || service?.nameAr || "");
  const [description, setDescription] = useState(service?.description || "");
  const [descriptionAr, setDescriptionAr] = useState(service?.description_ar || service?.descriptionAr || "");
  const [isActive, setIsActive] = useState(service?.is_active !== undefined ? service.is_active : (service?.isActive !== undefined ? service.isActive : true));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    service?.icon || service?.image || service?.image_url || null
  );

  // Update form fields when service prop changes
  useEffect(() => {
    // Cleanup previous object URL if exists
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    if (service) {
      setName(service.name || "");
      setNameAr(service.name_ar || service.nameAr || "");
      setDescription(service.description || "");
      setDescriptionAr(service.description_ar || service.descriptionAr || "");
      setIsActive(service.is_active !== undefined ? service.is_active : (service.isActive !== undefined ? service.isActive : true));
      setImagePreview(service.icon || service.image || service.image_url || null);
      setImageFile(null); // Reset file input when switching between services
    } else {
      // Reset form for new specialty
      setName("");
      setNameAr("");
      setDescription("");
      setDescriptionAr("");
      setIsActive(true);
      setImagePreview(null);
      setImageFile(null);
    }
  }, [service]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("name_ar", nameAr || ""); // Always send, even if empty
    if (description) formData.append("description", description);
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
        <Label htmlFor="name">Name (English) *</Label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div>
        <Label htmlFor="nameAr">Name (Arabic)</Label>
        <Input 
          id="nameAr"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          maxLength={200}
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
        <Label htmlFor="image">Image {!service && "(optional)"}</Label>
        
        {/* Display existing image if available */}
        {imagePreview && !imageFile && (
          <div className="mb-3 relative inline-block">
            <img 
              src={imagePreview} 
              alt={name || "Specialty icon"} 
              className="w-32 h-32 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background"
              onClick={() => {
                setImagePreview(null);
                setImageFile(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Display preview of newly selected file */}
        {imageFile && (
          <div className="mb-3 relative inline-block">
            <img 
              src={URL.createObjectURL(imageFile)} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background"
              onClick={() => {
                // Cleanup object URL
                if (imagePreview && imagePreview.startsWith('blob:')) {
                  URL.revokeObjectURL(imagePreview);
                }
                setImageFile(null);
                // Restore previous image if it existed
                if (service) {
                  setImagePreview(service.icon || service.image || service.image_url || null);
                } else {
                  setImagePreview(null);
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Placeholder when no image */}
        {!imagePreview && !imageFile && (
          <div className="mb-3 w-32 h-32 bg-muted rounded-lg flex items-center justify-center border border-border">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        <Input 
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            
            // Cleanup previous object URL if exists
            if (imagePreview && imagePreview.startsWith('blob:')) {
              URL.revokeObjectURL(imagePreview);
            }
            
            setImageFile(file);
            if (file) {
              setImagePreview(URL.createObjectURL(file));
            } else {
              // Restore original image if clearing file input
              setImagePreview(service?.icon || service?.image || service?.image_url || null);
            }
          }}
        />
        <p className="text-sm text-muted-foreground mt-1">
          {service ? "Leave empty to keep current image, or upload a new one to replace it." : "Upload an image for this specialty."}
        </p>
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
        {service ? "Update Specialty" : "Create Specialty"}
      </Button>
    </form>
  );
}

