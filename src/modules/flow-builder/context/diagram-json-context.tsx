import { createContext, useContext } from 'react';

export type DiagramJsonContextType = {
  getNodes: () => any[];
  getEdges: () => any[];
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
};

export const DiagramJsonContext = createContext<DiagramJsonContextType | undefined>(undefined);

export function useDiagramJsonContext() {
  const ctx = useContext(DiagramJsonContext);
  if (!ctx) throw new Error('useDiagramJsonContext must be used within DiagramJsonContext.Provider');
  return ctx;
}
