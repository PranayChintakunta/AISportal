"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { processCheckIn } from "@/app/admin/events/[id]/scan/actions";
import { Button } from "@/components/ui/button";

export function QRScannerClient({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleScan = async (scannedData: string) => {
    if (status === "loading" || status === "success") return;
    
    setStatus("loading");
    setMessage("Verifying...");

    const result = await processCheckIn(eventId, scannedData);

    if (result.success) {
      setStatus("success");
      setMessage(result.message!);
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setMessage(result.error!);
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border-4 border-border-soft bg-black">
        {status === "idle" || status === "loading" ? (
          <Scanner 
            onScan={(detectedCodes) => {
              if (detectedCodes && detectedCodes.length > 0) {
                // Extract the raw string value from the first detected barcode
                handleScan(detectedCodes[0].rawValue);
              }
            }} 
            onError={(error) => console.log(error?.message)}
            scanDelay={1000} // Replaces options object
          />
        ) : (
          <div className="flex h-[300px] items-center justify-center bg-white p-6 text-center">
             <p className={`font-display text-xl font-bold ${status === "success" ? "text-green-600" : "text-red-600"}`}>
               {message}
             </p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm text-ink-faint">
          {status === "idle" ? "Point camera at student's QR code" : message}
        </p>
        
        {status !== "idle" && (
          <Button variant="ghost" size="sm" onClick={() => setStatus("idle")}>
            Scan Next
          </Button>
        )}
      </div>
    </div>
  );
}