import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useCreateManuscript, useCreateJob } from "@workspace/api-client-react";
import { UploadCloud, File, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const createManuscript = useCreateManuscript();
  const createJob = useCreateJob();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
        if (!title) {
          setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .docx or .txt file",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        }
      }
    }
  };

  const isValidFile = (file: File) => {
    return file.name.endsWith('.docx') || file.name.endsWith('.txt');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !file) {
      toast({
        title: "Missing fields",
        description: "Please provide a title and select a file.",
        variant: "destructive"
      });
      return;
    }

    try {
      // 1. Create Manuscript
      const manuscript = await createManuscript.mutateAsync({
        data: {
          title,
          originalFilename: file.name
        }
      });

      // (In a real app, upload file to S3 here using useGetUploadUrl)
      
      // 2. Create Formatting Job
      const job = await createJob.mutateAsync({
        data: {
          manuscriptId: manuscript.id
        }
      });

      // 3. Navigate to Format wizard
      setLocation(`/format/${job.id}`);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: "There was an error creating your manuscript.",
        variant: "destructive"
      });
    }
  };

  const isLoading = createManuscript.isPending || createJob.isPending;

  return (
    <AppLayout title="New Manuscript">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Upload Manuscript</CardTitle>
            <CardDescription>
              We accept Microsoft Word (.docx) and plain text (.txt) files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Manuscript Title</Label>
                <Input 
                  id="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Great Gatsby"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Manuscript File</Label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <File className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFile(null)}
                        disabled={isLoading}
                      >
                        Change file
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Drag and drop your file here, or
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          DOCX or TXT files up to 50MB
                        </p>
                      </div>
                      <Input 
                        id="file" 
                        type="file" 
                        accept=".docx,.txt" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      <Label 
                        htmlFor="file" 
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                      >
                        Browse Files
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isLoading || !file || !title.trim()} className="px-8">
                  {isLoading ? "Processing..." : "Continue to Setup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}