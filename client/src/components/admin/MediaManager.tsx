import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, FileText, Video, Music, Trash2, Download, Copy } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { MediaAsset } from "@shared/schema";

export default function MediaManager() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch media assets
  const { data: mediaAssets = [], isLoading } = useQuery<MediaAsset[]>({
    queryKey: ['/api/cms/media'],
  });

  // Upload media mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await apiRequest('POST', '/api/cms/media/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: `${data.uploadedFiles?.length || 0} file(s) uploaded successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/media'] });
      setSelectedFiles(null);
      setUploadProgress(0);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/cms/media/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "Media file has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/media'] });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles) {
      uploadMutation.mutate(selectedFiles);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Media URL has been copied to clipboard.",
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (mimeType.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    return 'Document';
  };

  const filteredAssets = mediaAssets.filter(asset => {
    if (filter === 'all') return true;
    if (filter === 'images') return asset.mimeType.startsWith('image/');
    if (filter === 'videos') return asset.mimeType.startsWith('video/');
    if (filter === 'documents') return !asset.mimeType.startsWith('image/') && !asset.mimeType.startsWith('video/');
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="media-manager-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="media-manager">
      {/* Header */}
      <div className="mt-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">Media Manager</h1>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Upload and manage media files for your website</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            Upload Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <Input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              data-testid="file-input"
              className="w-full"
            />
            {selectedFiles && (
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedFiles.length} file(s) selected
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    data-testid="button-upload"
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFiles(null)}
                    data-testid="button-cancel-upload"
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Media Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              data-testid="filter-all"
              className="flex-1 sm:flex-initial text-xs sm:text-sm min-h-[36px]"
            >
              All ({mediaAssets.length})
            </Button>
            <Button
              variant={filter === 'images' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('images')}
              data-testid="filter-images"
              className="flex-1 sm:flex-initial text-xs sm:text-sm min-h-[36px]"
            >
              Images ({mediaAssets.filter(a => a.mimeType.startsWith('image/')).length})
            </Button>
            <Button
              variant={filter === 'videos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('videos')}
              data-testid="filter-videos"
              className="flex-1 sm:flex-initial text-xs sm:text-sm min-h-[36px]"
            >
              Videos ({mediaAssets.filter(a => a.mimeType.startsWith('video/')).length})
            </Button>
            <Button
              variant={filter === 'documents' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('documents')}
              data-testid="filter-documents"
              className="flex-1 sm:flex-initial text-xs sm:text-sm min-h-[36px]"
            >
              Docs ({mediaAssets.filter(a => !a.mimeType.startsWith('image/') && !a.mimeType.startsWith('video/')).length})
            </Button>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden" data-testid={`media-card-${asset.id}`}>
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {asset.mimeType.startsWith('image/') ? (
                    <img
                      src={asset.url}
                      alt={asset.filename}
                      className="w-full h-full object-cover"
                      data-testid={`media-image-${asset.id}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      {getFileIcon(asset.mimeType)}
                      <span className="text-xs">{getFileTypeLabel(asset.mimeType)}</span>
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
                  <h4 className="font-medium text-xs sm:text-sm truncate" title={asset.filename}>
                    {asset.filename}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(asset.size)}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyUrl(asset.url)}
                      className="flex-1 text-xs min-h-[32px] touch-manipulation"
                      data-testid={`button-copy-url-${asset.id}`}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Copy URL</span>
                      <span className="sm:hidden">Copy</span>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="min-h-[32px] touch-manipulation"
                          data-testid={`button-delete-${asset.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Media File</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>Are you sure you want to delete "{asset.filename}"? This action cannot be undone.</p>
                          <div className="flex flex-col sm:flex-row gap-2 justify-end">
                            <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(asset.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-confirm-delete-${asset.id}`}
                              className="w-full sm:w-auto min-h-[44px]"
                            >
                              {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-12" data-testid="empty-media-state">
              <div className="text-muted-foreground">
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No media files found</p>
                <p className="text-sm">Upload some files to get started with your media library.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}