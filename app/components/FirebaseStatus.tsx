"use client";

import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "@/lib/firebase";

type Status = "checking" | "connected" | "error";

export default function FirebaseStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestore(app);
    getDoc(doc(db, "_connection", "test"))
      .then(() => {
        setStatus("connected");
      })
      .catch((err: unknown) => {
        const code = (err as { code?: string })?.code;
        if (code === "permission-denied" || code === "unauthenticated") {
          setStatus("connected");
        } else {
          setStatus("error");
          setError((err as Error).message ?? String(err));
        }
      });
  }, []);

  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 text-zinc-500">
        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
        Connecting to Firebase...
      </div>
    );
  }

  if (status === "connected") {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Connected to Firebase
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-red-600 dark:text-red-400">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Firebase connection failed
      </div>
      {error && <p className="text-xs text-zinc-500">{error}</p>}
    </div>
  );
}
