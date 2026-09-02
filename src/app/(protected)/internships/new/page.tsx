import Link from "next/link";

import {
  listActiveAcademicInstitutions,
  listAllActiveCourses,
  listAllActiveInternshipTypes,
} from "@/features/academic-catalog";
import { InternshipRegistrationForm } from "@/features/internships/components/internship-registration-form";
import { listOrganizations } from "@/features/organizations";
import { listStudentSupervisors } from "@/features/supervisors";
import { getCurrentProfile } from "@/features/users";

export default async function NewInternshipPage() {
  const [
    profileResult,
    institutionsResult,
    coursesResult,
    internshipTypesResult,
    organizationsResult,
    supervisorsResult,
  ] = await Promise.all([
    getCurrentProfile(),
    listActiveAcademicInstitutions(),
    listAllActiveCourses(),
    listAllActiveInternshipTypes(),
    listOrganizations(),
    listStudentSupervisors(),
  ]);

  const hasLoadError =
    !profileResult.ok ||
    !profileResult.data ||
    !institutionsResult.ok ||
    !coursesResult.ok ||
    !internshipTypesResult.ok ||
    !organizationsResult.ok ||
    !supervisorsResult.ok;

  if (hasLoadError) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <p className="text-sm font-semibold text-amber-800">Cadastro indisponível</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950">
          Não foi possível preparar os dados do estágio.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-800">
          Sua sessão continua protegida. Atualize a página e tente novamente.
        </p>
        <Link href="/internships" className="mt-5 inline-flex font-semibold text-amber-950 underline">
          Voltar para Meu Estágio
        </Link>
      </section>
    );
  }

  const eligibleCourses = coursesResult.data.filter((course) =>
    internshipTypesResult.data.some((type) => type.course_id === course.id),
  );
  const eligibleInstitutions = institutionsResult.data.filter((institution) =>
    eligibleCourses.some(
      (course) => course.academic_institution_id === institution.id,
    ),
  );
  const eligibleCourseIds = new Set(eligibleCourses.map((course) => course.id));
  const eligibleInternshipTypes = internshipTypesResult.data.filter((type) =>
    eligibleCourseIds.has(type.course_id),
  );

  if (
    eligibleInstitutions.length === 0 ||
    eligibleCourses.length === 0 ||
    eligibleInternshipTypes.length === 0
  ) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-indigo-600">Novo estágio</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          O catálogo acadêmico ainda não está configurado.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          É necessário existir ao menos uma instituição, curso e modalidade ativos antes do primeiro cadastro.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <Link href="/internships" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          ← Meu Estágio
        </Link>
        <p className="mt-5 text-sm font-semibold text-indigo-600">Novo estágio</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Cadastre seu estágio supervisionado
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Informe o vínculo acadêmico, a instituição concedente e o período. O StageTrack protege sua identidade e copia automaticamente a carga obrigatória definida pela modalidade.
        </p>
      </section>

      <InternshipRegistrationForm
        institutions={eligibleInstitutions}
        courses={eligibleCourses}
        internshipTypes={eligibleInternshipTypes}
        organizations={organizationsResult.data}
        supervisors={supervisorsResult.data}
        initialCourseId={profileResult.data.course_id}
      />
    </div>
  );
}
