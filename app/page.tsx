"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DarkThemeToggle,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import { HiInformationCircle } from "react-icons/hi";
import OpenAI from "openai";
import { FHIR, Patient, openOauthSignIn } from "@/api/fhirApi";
import StepListItem from "@/components/StepListItem";
import StepDetail from "@/components/StepDetail";

interface FormInput {
  key: string;
  save: boolean;
}

const openAiKeyStorageKye = "openAiKey";

export default function Home() {
  const [client] = useState(new FHIR());

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [openAiKey, setOpenAiKey] = useState("");
  const [patient, setPatient] = useState<Patient | undefined>();
  const [error, setError] = useState("");
  const [chatGptResult, setChatGptResult] = useState("");

  const { register, handleSubmit } = useForm<FormInput>();

  const signIn = async () => {
    setIsSigningIn(true);
    await openOauthSignIn();
  };

  const onSubmit = async (data: FormInput) => {
    setOpenAiKey(data.key);
    if (data.save) {
      localStorage.setItem(openAiKeyStorageKye, data.key);
    }
    setCurrentStep(3);
  };

  const loadPage = useCallback(async () => {
    try {
      const clientIsLoaded = await client.isLoaded();
      if (!clientIsLoaded) {
        throw new Error("No Epic session");
      }
      const patient = await client.fetchPatient();
      setPatient(patient);
      setCurrentStep(2);
      const key = localStorage.getItem(openAiKeyStorageKye);
      if (key) {
        setOpenAiKey(key);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [client]);

  const runChatGpt = useCallback(async () => {
    try {
      setLoading(true);
      if (!openAiKey) {
        throw new Error("no key");
      }
      const reports = await client.fetchDiagnosticReports();
      const openai = new OpenAI({
        apiKey: openAiKey,
        dangerouslyAllowBrowser: true,
      });
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `what do my diagnositic reports include an xray? Here are my diagnostic reports: ${JSON.stringify(reports)}`,
          },
        ],
        model: "gpt-3.5-turbo",
      });
      const message = completion.choices[0]?.message.content;
      if (message) {
        setChatGptResult(message);
        setCurrentStep(4);
        setLoading(false);
      } else {
        throw new Error("no message from ChatGPT");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(`${error}`);
      }
    }
    setLoading(false);
  }, [client, openAiKey]);

  const resetKey = () => {
    localStorage.removeItem(openAiKeyStorageKye);
    setOpenAiKey("");
    setCurrentStep(2);
  };

  useEffect(() => {
    if (isInitialLoad) {
      loadPage();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, loadPage]);

  useEffect(() => {
    if (openAiKey && !chatGptResult) {
      runChatGpt();
    }
  }, [runChatGpt, openAiKey, chatGptResult]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 dark:bg-gray-800">
      <div className="flex flex-row items-center justify-center gap-2">
        <h1 className="text-2xl dark:text-white">Epic EHR Demo</h1>
        <DarkThemeToggle />
      </div>

      {!!error && (
        <div className="w-full px-4 md:w-3/4 md:px-0">
          <Alert
            color="failure"
            icon={HiInformationCircle}
            onDismiss={() => setError("")}
          >
            <span className="font-medium">Error!</span> {error}
          </Alert>
        </div>
      )}

      <div className="mt-8 grid w-full grid-cols-3 gap-4 px-4 md:w-3/4 md:px-0">
        <ol className="space-y-4">
          <StepListItem step={1} currentStep={currentStep} label="1. Sign In" />
          <StepListItem
            step={2}
            currentStep={currentStep}
            label="2. Provide OpenAI Key"
          />
          <StepListItem
            step={3}
            currentStep={currentStep}
            label="3. Query ChatGPT"
          />
          <StepListItem step={4} currentStep={currentStep} label="4. Results" />
        </ol>

        <div className="col-span-2">
          <StepDetail step={1} currentStep={currentStep} loading={loading}>
            <Card>
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Sign in to your Epic account:
              </h5>
              <Button isProcessing={isSigningIn} onClick={signIn}>
                Sign In
              </Button>
            </Card>
          </StepDetail>

          <StepDetail step={2} currentStep={currentStep} loading={loading}>
            <Card>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <p className="mb-2 text-gray-900 dark:text-white">
                    Welcome {patient?.name?.[0]?.text}
                  </p>
                  <div className="mb-2 block">
                    <Label htmlFor="key" value="OpenAI (ChatGPT) key" />
                  </div>
                  <TextInput {...register("key", { required: true })} />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="save">Save to local storage</Label>
                  <Checkbox id="save" {...register("save")} />
                </div>
                <Button type="submit">Submit</Button>
              </form>
            </Card>
          </StepDetail>

          <StepDetail step={3} currentStep={currentStep} loading={false}>
            <Card>
              <div className="flex flex-col items-center justify-center">
                <h5 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Querying...
                </h5>
                <p className="mb-4 text-sm tracking-tight text-gray-900 dark:text-white">
                  {`Asking ChatGPT: "what do my diagnositic reports include an xray? Here are my diagnostic reports: {DiagnosticReports}"`}
                </p>
                <Spinner />
              </div>

              <Button onClick={resetKey}>Reset Key</Button>
            </Card>
          </StepDetail>

          <StepDetail step={4} currentStep={currentStep} loading={false}>
            <Card>
              <div className="flex flex-col items-center justify-center">
                <h5 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  ChatGPT Response:
                </h5>
                <p className="mb-4 text-sm tracking-tight text-gray-900 dark:text-white">
                  {chatGptResult}
                </p>
              </div>
            </Card>
          </StepDetail>
        </div>
      </div>
    </main>
  );
}
