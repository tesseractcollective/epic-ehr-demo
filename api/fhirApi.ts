import fhir from "fhirclient";
import Client from "fhirclient/lib/Client";
import { fhirclient } from "fhirclient/lib/types";

export type Resource = fhirclient.FHIR.Resource;
export type Bundle = fhirclient.FHIR.Bundle;
export type Patient = fhirclient.FHIR.Patient;

export async function openOauthSignIn(local: boolean): Promise<string | void> {
  return fhir.oauth2.authorize({
    iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/",
    client_id: local
      ? "1aea8201-9c37-4258-b682-b13f4d62c536"
      : "924ab79c-c9c4-4176-901c-707b44728f09",
    scope:
      "patient/Patient.read patient/Condition.read patient/AllergyIntolerance.read patient/launch",
    redirect_uri: local
      ? "http://localhost:3000/callback"
      : "https://epic-ehr-demo.netlify.app/callback",
  });
}

function wait(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 1);
  });
}

export class FHIR {
  static loadingClient = false;
  private _client: Client | undefined;

  private async client(): Promise<Client> {
    while (FHIR.loadingClient) {
      await wait();
    }
    if (this._client) {
      return this._client;
    }

    FHIR.loadingClient = true;
    const client = await fhir.oauth2.ready();
    this._client = client;
    FHIR.loadingClient = false;
    return client;
  }

  async isLoaded(): Promise<boolean> {
    const client = await this.client();
    return client.patient.id !== null;
  }

  async fetchPatient(): Promise<Patient> {
    const client = await this.client();
    return client.request<Patient>(`Patient/${client.patient.id}`);
  }

  async fetchDiagnosticReports(): Promise<Resource[]> {
    const client = await this.client();
    const response = await client.request<Bundle>(
      `DiagnosticReport?patient=${client.patient.id}`,
    );
    return (response.entry ?? []).map((entry) => entry.resource);
  }
}
