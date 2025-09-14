/**
 * TypeScript interfaces for Open WebUI Chatbot Builder Extension
 * These interfaces ensure type safety between the React frontend and Python backend
 */

// Core React Flow types (extending @xyflow/react)
export interface NodePosition {
  x: number;
  y: number;
}

// Base node data interface
export interface BaseNodeData {
  [key: string]: any;
}

// Specific node data interfaces matching Python models
export interface TextMessageNodeData extends BaseNodeData {
  channel: 'sms' | 'whatsapp' | 'messenger' | 'email' | 'webchat';
  message: string;
}

export interface ConditionalPathNodeData extends BaseNodeData {
  condition: string;
}

export interface StartNodeData extends BaseNodeData {
  // Start nodes typically don't need additional data
}

export interface EndNodeData extends BaseNodeData {
  // End nodes typically don't need additional data
}

// Union type for all node data types
export type NodeData =
  | TextMessageNodeData
  | ConditionalPathNodeData
  | StartNodeData
  | EndNodeData;

// Flow node interface (extends React Flow's Node)
export interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'textMessage' | 'conditionalPath';
  position: NodePosition;
  data: NodeData;
}

// Flow edge interface (extends React Flow's Edge)
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

// Complete chatbot flow data structure
export interface ChatbotFlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  timestamp?: number;
  metadata?: Record<string, any>;
}

// Open WebUI communication interfaces
export interface OpenWebUIMessage {
  type: 'ready' | 'loadData' | 'saveDrawing' | 'dataLoaded';
  payload?: ChatbotFlowData | null;
  success?: boolean;
  error?: string;
  message?: string;
}

// Message types for parent-child communication
export interface SaveDrawingMessage {
  type: 'saveDrawing';
  payload: ChatbotFlowData;
}

export interface LoadDataMessage {
  type: 'loadData';
  payload: ChatbotFlowData | null;
}

export interface ReadyMessage {
  type: 'ready';
}

export interface DataLoadedMessage {
  type: 'dataLoaded';
  success: boolean;
  message?: string;
  error?: string;
}

// Union type for all message types
export type MessageType =
  | SaveDrawingMessage
  | LoadDataMessage
  | ReadyMessage
  | DataLoadedMessage;

// Custom event for Open WebUI integration
export interface ChatbotFlowSavedEvent extends CustomEvent {
  detail: ChatbotFlowData;
}

// Window interface extension for global data
declare global {
  interface Window {
    chatbotFlowData?: ChatbotFlowData;
    existingFlowData?: ChatbotFlowData;
  }
}

// Open WebUI Action Function response interface
export interface ActionFunctionResponse {
  content: string;
  format?: 'markdown' | 'html' | 'text';
  files?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

// Validation functions with TypeScript support
export function isValidFlowData(data: any): data is ChatbotFlowData {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.nodes) &&
    Array.isArray(data.edges) &&
    data.nodes.every(isValidNode) &&
    data.edges.every(isValidEdge)
  );
}

export function isValidNode(node: any): node is FlowNode {
  return (
    node &&
    typeof node.id === 'string' &&
    typeof node.type === 'string' &&
    node.position &&
    typeof node.position.x === 'number' &&
    typeof node.position.y === 'number' &&
    node.data &&
    typeof node.data === 'object'
  );
}

export function isValidEdge(edge: any): edge is FlowEdge {
  return (
    edge &&
    typeof edge.id === 'string' &&
    typeof edge.source === 'string' &&
    typeof edge.target === 'string' &&
    typeof edge.type === 'string'
  );
}

// Type guard for message types
export function isOpenWebUIMessage(data: any): data is OpenWebUIMessage {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.type === 'string' &&
    ['ready', 'loadData', 'saveDrawing', 'dataLoaded'].includes(data.type)
  );
}

// Utility type for React Flow node types
export type ReactFlowNodeType = FlowNode['type'];

// Configuration interface for the extension
export interface ChatbotBuilderConfig {
  chatbotBuilderUrl: string;
  enableBuilder: boolean;
  debugMode: boolean;
}

// Error handling interfaces
export interface FlowValidationError {
  type: 'validation';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface CommunicationError {
  type: 'communication';
  message: string;
  origin?: string;
}

export type ChatbotBuilderError = FlowValidationError | CommunicationError;

// Export default interface for the main component
export interface ChatbotBuilderProps {
  initialData?: ChatbotFlowData;
  onSave?: (data: ChatbotFlowData) => void;
  onError?: (error: ChatbotBuilderError) => void;
  config?: Partial<ChatbotBuilderConfig>;
}
