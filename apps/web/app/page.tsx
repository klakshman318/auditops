"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type ReactNode, useMemo, useRef, useState } from "react";

type ScanStartResponse = {
  scanId?: string;
  id?: string;
  _id?: string;
  message?: string;
  error?: string;
  data?: {
    scanId?: string;
    id?: string;
    _id?: string;
  };
  scan?: {
    scanId?: string;
    id?: string;
    _id?: string;
  };
};

function getScanIdFromResponse(data: ScanStartResponse): string | null {
  const scanId =
    data?.scanId ||
    data?.id ||
    data?._id ||
    data?.data?.scanId ||
    data?.data?.id ||
    data?.data?._id ||
    data?.scan?.scanId ||
    data?.scan?.id ||
    data?.scan?._id;

  return scanId ? String(scanId) : null;
}

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm">
      {children}
    </span>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M20 16.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-5" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7V5a1 1 0 0 1 1-1h2" />
      <path d="M17 4h2a1 1 0 0 1 1 1v2" />
      <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
      <path d="M7 20H5a1 1 0 0 1-1-1v-2" />
      <path d="M7 12h10" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6a3 3 0 0 1 5-2.2A3 3 0 0 1 18 6v10a4 4 0 0 1-4 4h-1" />
      <path d="M8 6a3 3 0 0 0-3 3 3 3 0 0 0 0 6 3 3 0 0 0 3 3" />
      <path d="M8 6v12" />
      <path d="M12 8h2" />
      <path d="M12 14h3" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const statusTone = useMemo(() => {
    const value = status.toLowerCase();

    if (!status) return "text-slate-500";
    if (
      value.includes("failed") ||
      value.includes("wrong") ||
      value.includes("missing") ||
      value.includes("invalid")
    ) {
      return "text-red-600";
    }

    if (value.includes("please")) return "text-amber-600";
    if (value.includes("uploading") || value.includes("opening") || value.includes("starting")) {
      return "text-blue-600";
    }

    return "text-emerald-600";
  }, [status]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setUploadProgress(0);
    setStatus(selectedFile ? `${selectedFile.name} selected.` : "");
  };

  const startScan = () => {
    if (!file) {
      setStatus("Please select a zip file first.");
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "");

    if (!apiBase) {
      setStatus("Missing NEXT_PUBLIC_API_BASE. Please check your .env.local file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setStatus("Uploading repository zip...");

    const formData = new FormData();

    /**
     * Important:
     * This field name must match your backend interceptor.
     * If backend uses FileInterceptor("zip"), keep "zip".
     * If backend uses FileInterceptor("file"), change this to "file".
     */
    formData.append("zip", file);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${apiBase}/scans`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      const percent = Math.round((event.loaded / event.total) * 100);
      setUploadProgress(percent);
    };

    xhr.upload.onload = () => {
      setUploadProgress(100);
      setStatus("Upload complete. Starting scan...");
    };

    xhr.onload = () => {
      let data: ScanStartResponse = {};

      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch (error) {
        console.error("Invalid scan response:", xhr.responseText, error);
        setIsUploading(false);
        setStatus("Upload completed, but server returned an invalid response.");
        return;
      }

      console.log("Scan API status:", xhr.status);
      console.log("Scan API response:", data);

      if (xhr.status < 200 || xhr.status >= 300) {
        setIsUploading(false);
        setStatus(data?.message || data?.error || "Failed to start scan.");
        return;
      }

      const scanId = getScanIdFromResponse(data);

      if (!scanId) {
        setIsUploading(false);
        setStatus("Upload completed, but scanId was not returned by the server. Check browser console.");
        return;
      }

      setStatus("Scan started. Opening report...");

      const scanUrl = `/scan/${encodeURIComponent(scanId)}`;

      router.push(scanUrl);

      setTimeout(() => {
        if (window.location.pathname !== scanUrl) {
          window.location.assign(scanUrl);
        }
      }, 400);
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setStatus("Upload failed. Please check API server, CORS, and NEXT_PUBLIC_API_BASE.");
    };

    xhr.onabort = () => {
      setIsUploading(false);
      setStatus("Upload cancelled.");
    };

    xhr.send(formData);
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-6 sm:px-8">
      <nav className="mb-16 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-slate-950">
          <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
            A
          </span>
          AuditOps
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link href="/product" className="transition hover:text-slate-950">
            Product
          </Link>
          <Link href="/pricing" className="transition hover:text-slate-950">
            Pricing
          </Link>
        </div>
      </nav>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <ScanIcon />
            Repository security and compliance scanner
          </div>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Find VAPT risks before they become release blockers.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Upload a repository zip and AuditOps will scan for security findings, compliance risks,
            secrets, and remediation guidance.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Code scanning", <ScanIcon key="scan" />],
              ["Compliance mapping", <ShieldIcon key="shield" />],
              ["AI remediation", <BrainIcon key="brain" />],
            ].map(([item, icon]) => (
              <div key={String(item)} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <IconBadge>{icon}</IconBadge>
                <p className="mt-4 font-bold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Start scan
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
              Upload repository zip
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select a zip file from your local machine. The scan report opens automatically after upload.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="group flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/60 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-white text-slate-950 shadow-sm transition group-hover:scale-105">
              <UploadIcon />
            </span>

            <span className="mt-4 text-base font-bold text-slate-900">
              {file ? file.name : "Choose repository zip"}
            </span>

            <span className="mt-1 text-sm text-slate-500">
              Only .zip files are supported
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />

          {(isUploading || uploadProgress > 0) && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-950 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={startScan}
            disabled={!file || isUploading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
          >
            <UploadIcon />
            {isUploading ? "Uploading..." : "Upload and Scan"}
          </button>

          <p className={`mt-4 text-sm font-semibold ${statusTone}`}>
            {status || "Select vulnerable-demo.zip and click Upload and Scan."}
          </p>
        </section>
      </section>
    </main>
  );
}