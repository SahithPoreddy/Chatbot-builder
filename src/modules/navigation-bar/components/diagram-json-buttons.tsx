import { useCallback, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';

export function DiagramJsonButtons() {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download current diagram as JSON
  const handleDownload = useCallback(() => {
    const data = {
      nodes: getNodes(),
      edges: getEdges(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [getNodes, getEdges]);

  // Upload JSON and render diagram
  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
          setNodes(data.nodes);
          setEdges(data.edges);
        } else {
          alert('Invalid diagram JSON format.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges]);

  return (
    <div className="flex items-center gap-x-2">
      <button
        type="button"
        className="h-full flex items-center justify-center outline-none gap-x-2 border border-dark-300 rounded-lg bg-dark-300/50 px-3 text-sm transition active:(bg-dark-400) hover:(bg-dark-200)"
        onClick={handleDownload}
      >
        <div className="i-mynaui:download size-4.5" />
        <span>Download JSON</span>
      </button>
      <label
        className="h-full flex items-center justify-center outline-none gap-x-2 border border-dark-300 rounded-lg bg-dark-300/50 px-3 text-sm transition active:(bg-dark-400) hover:(bg-dark-200) cursor-pointer"
      >
        <div className="i-mynaui:upload size-4.5" />
        <span>Upload JSON</span>
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}
