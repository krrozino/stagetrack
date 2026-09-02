export type InternshipRegistrationField =
  | "academicInstitutionId"
  | "courseId"
  | "internshipTypeId"
  | "organizationMode"
  | "organizationId"
  | "supervisorId"
  | "newOrganizationName"
  | "newOrganizationDocument"
  | "newOrganizationEmail"
  | "newOrganizationPhone"
  | "newOrganizationAddress"
  | "newOrganizationCity"
  | "newOrganizationState"
  | "newOrganizationPostalCode"
  | "startDate"
  | "expectedEndDate";

export type InternshipRegistrationActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<InternshipRegistrationField, string>>;
};

export const INITIAL_INTERNSHIP_REGISTRATION_STATE: InternshipRegistrationActionState = {
  status: "idle",
};
