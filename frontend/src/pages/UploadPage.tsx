import ExcelUpload from "../components/ExcelUpload";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Import Excel</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Upload a workbook to seed or refresh position data.</p>
      </section>
      <ExcelUpload />
    </div>
  );
}
