import { Download } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import { exportDashboardPdf } from "../utils/exportDashboardPdf";

const ExportReportButton = ({ dashboardData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      await exportDashboardPdf(dashboardData);
    } catch {
      setError("No se pudo generar el reporte PDF. Inténtalo nuevamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        color="black"
        size="md"
        className="flex gap-2"
        onClick={handleExport}
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Generando PDF..." : "Exportar reporte PDF"}
      </Button>
      <ErrorMessage message={error} />
    </div>
  );
};

export default ExportReportButton;
