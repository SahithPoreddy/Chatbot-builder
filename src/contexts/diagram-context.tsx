import { createContext, useContext } from 'react';

type DiagramContextType = {
  getNodes: () => any[];
  getEdges: () => any[];
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
};

const DiagramContext = createContext<DiagramContextType | null>(null);

export const DiagramProvider = DiagramContext.Provider;

export const useDiagram = () => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  return context;
};
