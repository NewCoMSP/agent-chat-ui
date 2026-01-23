import { useState, useRef, useEffect, ChangeEvent } from "react";
import { toast } from "sonner";
import { ContentBlock } from "@langchain/core/messages";
import { fileToContentBlock } from "@/lib/multimodal-utils";
import { useSession } from "next-auth/react";
import { getApiKey } from "@/lib/api-key";

export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Document upload result from backend
export interface DocumentUploadResult {
  document_id: string;
  filename: string;
  mime_type: string;
  sha256: string;
  created_at: string;
}

interface UseFileUploadOptions {
  initialBlocks?: ContentBlock.Multimodal.Data[];
  apiUrl?: string;
  threadId?: string | null;
}

export function useFileUpload({
  initialBlocks = [],
  apiUrl = "http://localhost:8080",
  threadId = null,
}: UseFileUploadOptions = {}) {
  const { data: session } = useSession();
  // Separate images (content blocks) from PDFs (documents)
  const [contentBlocks, setContentBlocks] =
    useState<ContentBlock.Multimodal.Data[]>(
      initialBlocks.filter((b) => b.type === "image")
    );
  const [pendingDocuments, setPendingDocuments] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentUploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragCounter = useRef(0);

  // Upload PDF to backend and get document_id
  const uploadDocument = async (file: File): Promise<DocumentUploadResult | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (threadId) {
        formData.append("thread_id", threadId);
      }

      // Build authentication headers
      const headers: Record<string, string> = {};
      
      // Prefer session token (fresh) over localStorage (potentially stale)
      const token = session?.user?.idToken || getApiKey();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      // Add organization context if available
      const orgContext = typeof window !== 'undefined' ? localStorage.getItem('reflexion_org_context') : null;
      if (orgContext) {
        headers['X-Organization-Context'] = orgContext;
      }

      const response = await fetch(`${apiUrl}/documents/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(error.error || `Upload failed: ${response.statusText}`);
      }

      const result: DocumentUploadResult = await response.json();
      return result;
    } catch (error) {
      console.error("[FileUpload] Document upload failed:", error);
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  };

  const isDuplicate = (file: File) => {
    if (file.type === "application/pdf") {
      return pendingDocuments.some((f) => f.name === file.name) ||
             uploadedDocuments.some((d) => d.filename === file.name);
    }
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return contentBlocks.some(
        (b) =>
          b.type === "image" &&
          b.metadata?.name === file.name &&
          b.mimeType === file.type,
      );
    }
    return false;
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) =>
      SUPPORTED_FILE_TYPES.includes(file.type),
    );
    const invalidFiles = fileArray.filter(
      (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
    );
    const duplicateFiles = validFiles.filter(isDuplicate);
    const uniqueFiles = validFiles.filter((file) => !isDuplicate(file));

    if (invalidFiles.length > 0) {
      toast.error(
        "You have uploaded invalid file type. Please upload a JPEG, PNG, GIF, WEBP image or a PDF.",
      );
    }
    if (duplicateFiles.length > 0) {
      toast.error(
        `Duplicate file(s) detected: ${duplicateFiles.map((f) => f.name).join(", ")}. Each file can only be uploaded once per message.`,
      );
    }

    // Separate images from PDFs
    const imageFiles = uniqueFiles.filter((f) => SUPPORTED_IMAGE_TYPES.includes(f.type));
    const pdfFiles = uniqueFiles.filter((f) => f.type === "application/pdf");

    // Process images as content blocks (existing behavior)
    if (imageFiles.length > 0) {
      const newBlocks = await Promise.all(imageFiles.map(fileToContentBlock));
      setContentBlocks((prev) => [...prev, ...newBlocks]);
    }

    // Upload PDFs to backend
    if (pdfFiles.length > 0) {
      setUploading(true);
      setPendingDocuments((prev) => [...prev, ...pdfFiles]);
      
      try {
        const uploadResults = await Promise.all(
          pdfFiles.map((file) => uploadDocument(file))
        );
        
        const successful = uploadResults.filter((r): r is DocumentUploadResult => r !== null);
        if (successful.length > 0) {
          setUploadedDocuments((prev) => [...prev, ...successful]);
          toast.success(`Uploaded ${successful.length} document(s)`);
        }
        
        // Remove successfully uploaded files from pending
        setPendingDocuments((prev) => 
          prev.filter((f) => !pdfFiles.some((pf) => pf.name === f.name))
        );
      } catch (error) {
        console.error("[FileUpload] Error uploading documents:", error);
      } finally {
        setUploading(false);
      }
    }

    e.target.value = "";
  };

  // Drag and drop handlers
  useEffect(() => {
    if (!dropRef.current) return;

    // Global drag events with counter for robust dragOver state
    const handleWindowDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        dragCounter.current += 1;
        setDragOver(true);
      }
    };
    const handleWindowDragLeave = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
          setDragOver(false);
          dragCounter.current = 0;
        }
      }
    };
    const handleWindowDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragOver(false);

      if (!e.dataTransfer) return;

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((file) =>
        SUPPORTED_FILE_TYPES.includes(file.type),
      );
      const invalidFiles = files.filter(
        (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
      );
      const duplicateFiles = validFiles.filter(isDuplicate);
      const uniqueFiles = validFiles.filter((file) => !isDuplicate(file));

      if (invalidFiles.length > 0) {
        toast.error(
          "You have uploaded invalid file type. Please upload a JPEG, PNG, GIF, WEBP image or a PDF.",
        );
      }
      if (duplicateFiles.length > 0) {
        toast.error(
          `Duplicate file(s) detected: ${duplicateFiles.map((f) => f.name).join(", ")}. Each file can only be uploaded once per message.`,
        );
      }

      // Separate images from PDFs
      const imageFiles = uniqueFiles.filter((f) => SUPPORTED_IMAGE_TYPES.includes(f.type));
      const pdfFiles = uniqueFiles.filter((f) => f.type === "application/pdf");

      // Process images as content blocks
      if (imageFiles.length > 0) {
        const newBlocks = await Promise.all(imageFiles.map(fileToContentBlock));
        setContentBlocks((prev) => [...prev, ...newBlocks]);
      }

      // Upload PDFs to backend
      if (pdfFiles.length > 0) {
        setUploading(true);
        setPendingDocuments((prev) => [...prev, ...pdfFiles]);
        
        try {
          const uploadResults = await Promise.all(
            pdfFiles.map((file) => uploadDocument(file))
          );
          
          const successful = uploadResults.filter((r): r is DocumentUploadResult => r !== null);
          if (successful.length > 0) {
            setUploadedDocuments((prev) => [...prev, ...successful]);
            toast.success(`Uploaded ${successful.length} document(s)`);
          }
          
          setPendingDocuments((prev) => 
            prev.filter((f) => !pdfFiles.some((pf) => pf.name === f.name))
          );
        } catch (error) {
          console.error("[FileUpload] Error uploading documents:", error);
        } finally {
          setUploading(false);
        }
      }
    };
    const handleWindowDragEnd = (e: DragEvent) => {
      dragCounter.current = 0;
      setDragOver(false);
    };
    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);
    window.addEventListener("dragend", handleWindowDragEnd);

    // Prevent default browser behavior for dragover globally
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("dragover", handleWindowDragOver);

    // Remove element-specific drop event (handled globally)
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    };
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    };
    const element = dropRef.current;
    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("dragenter", handleDragEnter);
    element.addEventListener("dragleave", handleDragLeave);

    return () => {
      element.removeEventListener("dragover", handleDragOver);
      element.removeEventListener("dragenter", handleDragEnter);
      element.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
      window.removeEventListener("dragend", handleWindowDragEnd);
      window.removeEventListener("dragover", handleWindowDragOver);
      dragCounter.current = 0;
    };
  }, [contentBlocks]);

  const removeBlock = (idx: number) => {
    setContentBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.document_id !== documentId));
  };

  const resetBlocks = () => {
    setContentBlocks([]);
    setUploadedDocuments([]);
    setPendingDocuments([]);
  };

  /**
   * Handle paste event for files (images, PDFs)
   * Can be used as onPaste={handlePaste} on a textarea or input
   */
  const handlePaste = async (
    e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const items = e.clipboardData.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length === 0) {
      return;
    }
    e.preventDefault();
    const validFiles = files.filter((file) =>
      SUPPORTED_FILE_TYPES.includes(file.type),
    );
    const invalidFiles = files.filter(
      (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
    );
    const duplicateFiles = validFiles.filter(isDuplicate);
    const uniqueFiles = validFiles.filter((file) => !isDuplicate(file));
    if (invalidFiles.length > 0) {
      toast.error(
        "You have pasted an invalid file type. Please paste a JPEG, PNG, GIF, WEBP image or a PDF.",
      );
    }
    if (duplicateFiles.length > 0) {
      toast.error(
        `Duplicate file(s) detected: ${duplicateFiles.map((f) => f.name).join(", ")}. Each file can only be uploaded once per message.`,
      );
    }

    // Separate images from PDFs
    const imageFiles = uniqueFiles.filter((f) => SUPPORTED_IMAGE_TYPES.includes(f.type));
    const pdfFiles = uniqueFiles.filter((f) => f.type === "application/pdf");

    // Process images as content blocks
    if (imageFiles.length > 0) {
      const newBlocks = await Promise.all(imageFiles.map(fileToContentBlock));
      setContentBlocks((prev) => [...prev, ...newBlocks]);
    }

    // Upload PDFs to backend
    if (pdfFiles.length > 0) {
      setUploading(true);
      setPendingDocuments((prev) => [...prev, ...pdfFiles]);
      
      try {
        const uploadResults = await Promise.all(
          pdfFiles.map((file) => uploadDocument(file))
        );
        
        const successful = uploadResults.filter((r): r is DocumentUploadResult => r !== null);
        if (successful.length > 0) {
          setUploadedDocuments((prev) => [...prev, ...successful]);
          toast.success(`Uploaded ${successful.length} document(s)`);
        }
        
        setPendingDocuments((prev) => 
          prev.filter((f) => !pdfFiles.some((pf) => pf.name === f.name))
        );
      } catch (error) {
        console.error("[FileUpload] Error uploading documents:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  return {
    contentBlocks,
    setContentBlocks,
    pendingDocuments,
    uploadedDocuments,
    uploading,
    handleFileUpload,
    dropRef,
    removeBlock,
    removeDocument,
    resetBlocks,
    dragOver,
    handlePaste,
  };
}
