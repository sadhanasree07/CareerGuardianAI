import type { RecoveryComplaint } from "@/lib/recoveryComplaint";

export default function ComplaintLetterPreview({ data }: { data: RecoveryComplaint }) {
  return (
    <article className="mx-auto min-h-[1050px] w-full max-w-[794px] border border-slate-200 bg-white px-7 py-8 text-slate-800 shadow-xl sm:px-14 sm:py-12" aria-label="Cyber incident complaint document preview">
      <header className="border-b-2 border-blue-700 pb-5">
        <p className="text-xs font-bold tracking-wide text-blue-800">CAREERGUARDIAN AI</p>
        <h3 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">CYBER INCIDENT COMPLAINT</h3>
        <p className="mt-1 text-sm text-slate-600">Recruitment Fraud / Scam Report</p>
        <dl className="mt-5 grid gap-2 text-xs sm:grid-cols-2 sm:text-sm">
          <div><dt className="inline font-semibold">Case ID: </dt><dd className="inline">{data.caseId}</dd></div>
          <div><dt className="inline font-semibold">Complaint Date: </dt><dd className="inline">{data.complaintDate}</dd></div>
        </dl>
      </header>

      <section className="mt-7 text-sm leading-6">
        <p className="font-bold tracking-wide text-slate-900">TO</p>
        <p className="mt-1">{data.recipient}</p>
        <p className="mt-5 font-bold tracking-wide text-slate-900">SUBJECT:</p>
        <p className="mt-1 font-medium">{data.subject}</p>
        <p className="mt-5">Respected Sir/Madam,</p>
        <p className="mt-3">{data.opening}</p>
      </section>

      <div className="mt-7 space-y-6">
        {data.sections.map((section) => (
          <section key={section.number}>
            <h4 className="border-b border-slate-200 pb-2 text-sm font-bold text-[#162B4A]">{section.number}. {section.title}</h4>
            {section.rows && (
              <table className="mt-3 w-full border-collapse text-left text-xs sm:text-sm">
                <tbody>
                  {section.rows.map(([label, value]) => (
                    <tr key={label} className="border border-slate-300 align-top">
                      <th scope="row" className="w-[38%] bg-slate-50 px-3 py-2 font-semibold text-slate-800">{label}</th>
                      <td className="break-words px-3 py-2">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {section.paragraph && <p className="mt-3 whitespace-pre-line break-words text-sm leading-6">{section.paragraph}</p>}
            {section.evidence && section.evidence.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[540px] border-collapse text-left text-xs sm:text-sm">
                  <thead><tr className="bg-slate-50">{["No.", "Evidence Type", "Description", "Status"].map((heading) => <th key={heading} className="border border-slate-300 px-2 py-2 font-semibold">{heading}</th>)}</tr></thead>
                  <tbody>{section.evidence.map((item) => <tr key={item.number} className="align-top"><td className="border border-slate-300 px-2 py-2">{item.number}</td><td className="border border-slate-300 px-2 py-2">{item.type}</td><td className="break-words border border-slate-300 px-2 py-2">{item.description}</td><td className="border border-slate-300 px-2 py-2">{item.status}</td></tr>)}</tbody>
                </table>
              </div>
            )}
            {section.bullets && <ul className="mt-3 list-disc space-y-1 pl-6 text-sm leading-6">{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>
        ))}
      </div>

      <section className="mt-10 break-inside-avoid text-sm leading-6">
        <p>Yours faithfully,</p>
        <div className="mt-12 w-64 border-t border-slate-500" />
        <p className="mt-2 font-semibold">{data.signature.name}</p>
        <p>Contact Number: {data.signature.phone}</p>
        <p>Email: {data.signature.email}</p>
        <p>Date: {data.signature.date}</p>
        <p>Signature: ________________________</p>
      </section>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-[10px] leading-4 text-slate-500">
        <p className="font-semibold text-slate-700">CareerGuardian AI · Protect · Verify · Recover · Succeed</p>
        <p>Case ID: {data.caseId}</p>
        <p>Generated from information provided by the complainant. CareerGuardian AI is not a law-enforcement authority or legal service.</p>
      </footer>
    </article>
  );
}
