"use client";

export default function DownloadCareerReport({
  data,
}: {
  data: any;
}) {

  function download() {

    const blob = new Blob(
      [
        JSON.stringify(data, null, 2),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "CareerDNAReport.json";

    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="mt-10 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-5 text-lg font-semibold text-white transition hover:opacity-90"
    >
      Download Career DNA Report
    </button>
  );
}