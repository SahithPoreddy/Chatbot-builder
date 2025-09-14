import { useState } from 'react';

type DiagramSvgButtonProps = {
  exportAsSvg: () => Promise<void>;
};

export default function DiagramSvgButton({ exportAsSvg }: DiagramSvgButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return; // Prevent multiple clicks

    setIsExporting(true);
    try {
      await exportAsSvg();
    } catch (error) {
      console.error('SVG export failed:', error);
      alert('Failed to export SVG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      title={isExporting ? "Exporting SVG..." : "Download diagram as SVG"}
      className="p-2 rounded bg-dark-200 hover:bg-dark-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <div className="i-mynaui:spinner size-5 animate-spin" />
      ) : (
        <div className="i-mynaui:image size-5" />
      )}
    </button>
  );
}
