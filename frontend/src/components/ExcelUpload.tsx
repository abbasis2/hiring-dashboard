import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import client from "../api/client";

export default function ExcelUpload() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string>("Choose a workbook with Outstanding Roles and Filled Roles tabs");
  const [selectedFile, setSelectedFile] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await client.post("/api/upload-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },
    onSuccess: (response) => {
      setMessage(`Imported ${response.data.imported_outstanding} outstanding roles and ${response.data.imported_filled} filled roles.`);
      setSelectedFile("");
      void queryClient.invalidateQueries({ queryKey: ["outstanding-roles"] });
      void queryClient.invalidateQueries({ queryKey: ["filled-roles"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    onError: (error) => {
      const detail = error instanceof AxiosError ? error.response?.data?.detail ?? error.message : "Upload failed.";
      setMessage(detail);
    }
  });

  return (
    <label className="card-shell flex cursor-pointer flex-col items-center justify-center gap-3 border-dashed text-center hover:bg-[var(--bg-elevated)]">
      <UploadCloud className="h-8 w-8 text-cyan-400" />
      <div>
        <p className="font-semibold">Upload workbook</p>
        <p className="text-sm text-[var(--text-secondary)]">Replace the web app data with the Outstanding Roles and Filled Roles tabs from Excel.</p>
      </div>
      <input
        ref={inputRef}
        accept=".xlsx,.xlsm,.xls"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setSelectedFile(file.name);
            setMessage("Uploading...");
            mutation.mutate(file);
          }
        }}
        type="file"
      />
      <span className="text-xs text-[var(--text-secondary)]">{mutation.isPending ? "Uploading..." : selectedFile || message}</span>
    </label>
  );
}
