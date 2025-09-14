import { useRef } from 'react';
import { convertFlowToMarkdown } from '~/utils/flow-to-markdown';

type DiagramJsonButtonsProps = {
  getNodes: () => any[];
  getEdges: () => any[];
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
};

export default function DiagramJsonButtons({ getNodes, getEdges, setNodes, setEdges }: DiagramJsonButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download current diagram as JSON
  const handleDownload = () => {
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
    document.body.appendChild(a);
    setTimeout(() => {
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Download current diagram as Markdown
  const handleDownloadMarkdown = () => {
    const data = {
      nodes: getNodes(),
      edges: getEdges(),
    };
    const markdown = convertFlowToMarkdown(data);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flow-documentation.md';
    document.body.appendChild(a);
    setTimeout(() => {
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Upload JSON and render diagram
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
          // Ensure all nodes and edges have valid type properties, but preserve all other properties
          const sanitizedNodes = data.nodes.map((node: any) => ({
            ...node,
            type: node.type || 'default',
          }));
          const nodeIds = new Set(sanitizedNodes.map((n: any) => n.id));
          let skippedEdges = 0;
          const sanitizedEdges = data.edges.map((edge: any) => {
            // Only keep id, source, target, type for edges (like default-nodes-edges.ts)
            return {
              id: edge.id || '',
              source: edge.source,
              target: edge.target,
              type: edge.type || 'deletable',
            };
          }).filter((edge: any) => {
            const valid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
            if (!valid) skippedEdges++;
            return valid;
          });
          setNodes(sanitizedNodes);
          setEdges(sanitizedEdges);
          if (skippedEdges > 0) {
            alert(`${skippedEdges} edge(s) were skipped due to missing source/target nodes.`);
          }
        } else {
          alert('Invalid diagram JSON format.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-2 items-center my-2">
      <button
        type="button"
        title="Download diagram as JSON"
        className="p-2 rounded bg-dark-200 hover:bg-dark-300 transition"
        onClick={handleDownload}
      >
        <div className="i-mynaui:download size-5" />
      </button>
      <label
        title="Upload diagram JSON"
        className="p-2 rounded bg-dark-200 hover:bg-dark-300 transition cursor-pointer"
      >
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <div className="i-mynaui:upload size-5" />
      </label>
      <button
        type="button"
        title="Download diagram as Markdown"
        className="p-2 rounded bg-dark-200 hover:bg-dark-300 transition"
        onClick={handleDownloadMarkdown}
      >
        <div className="i-mynaui:file-text size-5" />
      </button>
    </div>
  );
}
