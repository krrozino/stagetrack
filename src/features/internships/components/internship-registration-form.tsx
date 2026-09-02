"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import type {
  AcademicInstitution,
  Course,
  InternshipType,
} from "@/features/academic-catalog";
import type { Organization } from "@/features/organizations";
import type { Supervisor } from "@/features/supervisors";

import { registerInternshipAction } from "../actions/internship-registration.actions";
import {
  INITIAL_INTERNSHIP_REGISTRATION_STATE,
  type InternshipRegistrationField,
} from "../types.registration";

type InternshipRegistrationFormProps = {
  institutions: AcademicInstitution[];
  courses: Course[];
  internshipTypes: InternshipType[];
  organizations: Organization[];
  supervisors: Supervisor[];
  initialCourseId?: string | null;
};

function minutesLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}h` : `${hours}h${String(remaining).padStart(2, "0")}`;
}

function FieldError({
  field,
  errors,
}: {
  field: InternshipRegistrationField;
  errors?: Partial<Record<InternshipRegistrationField, string>>;
}) {
  const message = errors?.[field];
  return message ? <p className="mt-1 text-sm text-rose-600">{message}</p> : null;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Cadastrando estágio..." : "Cadastrar estágio"}
    </button>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export function InternshipRegistrationForm({
  institutions,
  courses,
  internshipTypes,
  organizations,
  supervisors,
  initialCourseId,
}: InternshipRegistrationFormProps) {
  const initialCourse =
    courses.find((course) => course.id === initialCourseId) ?? courses[0];
  const [institutionId, setInstitutionId] = useState(
    initialCourse?.academic_institution_id ?? institutions[0]?.id ?? "",
  );

  const availableCourses = useMemo(
    () => courses.filter((course) => course.academic_institution_id === institutionId),
    [courses, institutionId],
  );
  const validInitialCourse = availableCourses.some(
    (course) => course.id === initialCourse?.id,
  )
    ? initialCourse?.id ?? ""
    : availableCourses[0]?.id ?? "";
  const [courseId, setCourseId] = useState(validInitialCourse);

  const availableTypes = useMemo(
    () => internshipTypes.filter((type) => type.course_id === courseId),
    [internshipTypes, courseId],
  );
  const [internshipTypeId, setInternshipTypeId] = useState(
    availableTypes[0]?.id ?? "",
  );

  const [organizationMode, setOrganizationMode] = useState<"existing" | "new">(
    organizations.length > 0 ? "existing" : "new",
  );
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? "",
  );
  const [supervisorId, setSupervisorId] = useState("");

  const availableSupervisors = useMemo(
    () => supervisors.filter((supervisor) => supervisor.organization_id === organizationId),
    [supervisors, organizationId],
  );
  const selectedType = internshipTypes.find(
    (type) => type.id === internshipTypeId,
  );

  const [state, formAction] = useActionState(
    registerInternshipAction,
    INITIAL_INTERNSHIP_REGISTRATION_STATE,
  );

  function changeInstitution(nextInstitutionId: string) {
    setInstitutionId(nextInstitutionId);
    const nextCourse = courses.find(
      (course) => course.academic_institution_id === nextInstitutionId,
    );
    setCourseId(nextCourse?.id ?? "");
    const nextType = internshipTypes.find(
      (type) => type.course_id === nextCourse?.id,
    );
    setInternshipTypeId(nextType?.id ?? "");
  }

  function changeCourse(nextCourseId: string) {
    setCourseId(nextCourseId);
    const nextType = internshipTypes.find(
      (type) => type.course_id === nextCourseId,
    );
    setInternshipTypeId(nextType?.id ?? "");
  }

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.status === "error" && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {state.message}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div>
          <p className="text-sm font-semibold text-indigo-600">1. Vínculo acadêmico</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Curso e modalidade</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A carga obrigatória é definida pela modalidade e não pode ser digitada manualmente.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">
            Instituição de ensino
            <select
              name="academicInstitutionId"
              value={institutionId}
              onChange={(event) => changeInstitution(event.target.value)}
              className={inputClass}
              required
            >
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.acronym ? `${institution.acronym} — ` : ""}{institution.name}
                </option>
              ))}
            </select>
            <FieldError field="academicInstitutionId" errors={state.fieldErrors} />
          </label>

          <label className="text-sm font-semibold text-slate-800">
            Curso
            <select
              name="courseId"
              value={courseId}
              onChange={(event) => changeCourse(event.target.value)}
              className={inputClass}
              required
            >
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <FieldError field="courseId" errors={state.fieldErrors} />
          </label>

          <label className="text-sm font-semibold text-slate-800 md:col-span-2">
            Modalidade / componente
            <select
              name="internshipTypeId"
              value={internshipTypeId}
              onChange={(event) => setInternshipTypeId(event.target.value)}
              className={inputClass}
              required
            >
              {availableTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} — {minutesLabel(type.required_minutes)}
                </option>
              ))}
            </select>
            <FieldError field="internshipTypeId" errors={state.fieldErrors} />
          </label>
        </div>

        {selectedType && (
          <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Carga obrigatória</p>
            <p className="mt-1 text-lg font-bold text-indigo-950">{minutesLabel(selectedType.required_minutes)}</p>
            {selectedType.description && <p className="mt-1 text-sm text-indigo-800">{selectedType.description}</p>}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-semibold text-indigo-600">2. Instituição concedente</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Onde o estágio será realizado</h2>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
            <input
              type="radio"
              name="organizationMode"
              value="existing"
              checked={organizationMode === "existing"}
              disabled={organizations.length === 0}
              onChange={() => setOrganizationMode("existing")}
            />
            Selecionar existente
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
            <input
              type="radio"
              name="organizationMode"
              value="new"
              checked={organizationMode === "new"}
              onChange={() => {
                setOrganizationMode("new");
                setSupervisorId("");
              }}
            />
            Cadastrar nova
          </label>
        </div>

        {organizationMode === "existing" ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">
              Concedente
              <select
                name="organizationId"
                value={organizationId}
                onChange={(event) => {
                  setOrganizationId(event.target.value);
                  setSupervisorId("");
                }}
                className={inputClass}
                required
              >
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>{organization.name}</option>
                ))}
              </select>
              <FieldError field="organizationId" errors={state.fieldErrors} />
            </label>

            <label className="text-sm font-semibold text-slate-800">
              Supervisor responsável <span className="font-normal text-slate-500">(opcional)</span>
              <select
                name="supervisorId"
                value={supervisorId}
                onChange={(event) => setSupervisorId(event.target.value)}
                className={inputClass}
              >
                <option value="">Informar depois</option>
                {availableSupervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.name}{supervisor.position ? ` — ${supervisor.position}` : ""}
                  </option>
                ))}
              </select>
              <FieldError field="supervisorId" errors={state.fieldErrors} />
            </label>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800 md:col-span-2">
              Nome da concedente
              <input name="newOrganizationName" className={inputClass} placeholder="Ex.: Colégio Estadual..." required />
              <FieldError field="newOrganizationName" errors={state.fieldErrors} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              CNPJ / documento <span className="font-normal text-slate-500">(opcional)</span>
              <input name="newOrganizationDocument" className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              E-mail <span className="font-normal text-slate-500">(opcional)</span>
              <input name="newOrganizationEmail" type="email" className={inputClass} />
              <FieldError field="newOrganizationEmail" errors={state.fieldErrors} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Telefone <span className="font-normal text-slate-500">(opcional)</span>
              <input name="newOrganizationPhone" className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              CEP <span className="font-normal text-slate-500">(opcional)</span>
              <input name="newOrganizationPostalCode" className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-800 md:col-span-2">
              Endereço <span className="font-normal text-slate-500">(opcional)</span>
              <input name="newOrganizationAddress" className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Cidade <span className="font-normal text-slate-500">(opcional)</span>
              <input name="newOrganizationCity" className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Estado <span className="font-normal text-slate-500">(opcional)</span>
              <input name="newOrganizationState" className={inputClass} />
            </label>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-semibold text-indigo-600">3. Período</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Datas do estágio</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">
            Data de início
            <input name="startDate" type="date" className={inputClass} required />
            <FieldError field="startDate" errors={state.fieldErrors} />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Previsão de término <span className="font-normal text-slate-500">(opcional)</span>
            <input name="expectedEndDate" type="date" className={inputClass} />
            <FieldError field="expectedEndDate" errors={state.fieldErrors} />
          </label>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          O estágio será criado como rascunho. Sua identidade e a carga horária obrigatória são preenchidas e protegidas pelo banco.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
