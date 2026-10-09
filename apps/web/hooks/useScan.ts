"use client";

import { useEffect, useState } from "react";
import { ScanResult } from "@/types/scan";

export function useScan(scanId: string) {
    const [data, setData] = useState<ScanResult | null>(null);
    const [statusText, setStatusText] = useState("Loading...");

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const fetchScan = async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/scans/${scanId}`,
            );

            const json = (await res.json()) as ScanResult;
            setData(json);

            if (json.status === "QUEUED") setStatusText("Queued...");
            if (json.status === "RUNNING") setStatusText("Scanning...");
            if (json.status === "DONE") setStatusText("Done");
            if (json.status === "FAILED") setStatusText("Failed");

            if (json.status === "QUEUED" || json.status === "RUNNING") {
                timer = setTimeout(fetchScan, 1500);
            }
        };

        fetchScan();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [scanId]);

    return { data, statusText };
}