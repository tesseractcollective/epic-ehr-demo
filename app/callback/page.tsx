"use client";

import { HiInformationCircle } from "react-icons/hi";
import { useEffect, useState } from "react";
import { Alert, Spinner } from "flowbite-react";
import { FHIR } from "@/api/fhirApi";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState("");
  const load = async () => {
    const client = new FHIR();
    try {
      const isLoaded = await client.isLoaded();
      if (isLoaded) {
        router.push("/");
      } else {
        throw new Error("no patient loaded");
      }
    } catch (error) {
      console.log(error);
      setError("Unable to initialize Epic user session");
    }
  };

  useEffect(() => {
    load();
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 dark:bg-gray-800">
      {!!error ? (
        <Alert color="failure" icon={HiInformationCircle}>
          <span className="font-medium">Error:</span> {error}
        </Alert>
      ) : (
        <Spinner size="xl" />
      )}
    </main>
  );
}
