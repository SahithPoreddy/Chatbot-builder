import { createFileRoute } from '@tanstack/react-router'
import { ReactFlowProvider, useReactFlow } from '@xyflow/react'

import { FlowBuilderModule } from '~/modules/flow-builder/flow-builder-module'
import { SidebarModule } from '~/modules/sidebar/sidebar-module'
import { ToasterModule } from '~/modules/toaster/toaster-module'
import { AddNodeOnEdgeDropStateProvider } from '~/stores/add-node-on-edge-drop-state'

// Import TypeScript interfaces for Open WebUI integration
import type {
  ChatbotFlowData,
  FlowNode,
  FlowEdge,
} from '~/types/open-webui.types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function SaveButton() {
  const { getNodes, getEdges } = useReactFlow()

  const handleSave = () => {
    const nodes = getNodes() as FlowNode[]
    const edges = getEdges() as FlowEdge[]

    // Create properly typed flow data structure matching Python backend
    const drawingData: ChatbotFlowData = {
      nodes: nodes.map((node: FlowNode) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge: FlowEdge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      })),
      timestamp: Date.now()
    }

    console.log('📤 Sending TypeScript-typed data to parent:')
    console.log('Raw JSON data:', JSON.stringify(drawingData, null, 2))
    console.log('📊 Data summary:')
    console.log('- Nodes count:', drawingData.nodes.length)
    console.log('- Edges count:', drawingData.edges.length)
    console.log('- Timestamp:', drawingData.timestamp ? new Date(drawingData.timestamp).toLocaleString() : 'N/A')

    console.log('🔍 Node details:')
    drawingData.nodes.forEach((node, index) => {
      console.log(`  Node ${index + 1}:`, {
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      })
    })

    console.log('🔗 Edge details:')
    drawingData.edges.forEach((edge, index) => {
      console.log(`  Edge ${index + 1}:`, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type
      })
    })

    // Send the message to the parent window (supports both Open WebUI and direct iframe usage)
    const messageData = {
      type: 'saveDrawing',
      payload: drawingData  // Send as object, not stringified
    };

    // Try multiple target origins for compatibility
    const targetOrigins = [
      'http://localhost:5173',  // Development server
      'http://localhost:8080',  // Open WebUI default
      'http://localhost:3000',  // Alternative Open WebUI port
      '*'                       // Fallback for Open WebUI extension context
    ];

    // Send to all possible origins
    targetOrigins.forEach(origin => {
      try {
        window.parent.postMessage(messageData, origin);
        console.log(`📤 Data sent to parent with origin: ${origin}`);
      } catch (error) {
        console.warn(`Failed to send to origin ${origin}:`, error);
      }
    });

    // Also trigger a custom event for Open WebUI Action Function
    try {
      window.dispatchEvent(new CustomEvent('chatbotFlowSaved', {
        detail: drawingData
      }));
      console.log('🎯 Custom event dispatched for Open WebUI');
    } catch (error) {
      console.warn('Failed to dispatch custom event:', error);
    }

    // Store data globally for Open WebUI access
    try {
      (window as any).chatbotFlowData = drawingData;
      console.log('💾 Data stored globally for Open WebUI access');
    } catch (error) {
      console.warn('Failed to store data globally:', error);
    }

    console.log('✅ Data sent to parent successfully using multiple methods')
  }

  return (
    <button
      onClick={handleSave}
      className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors duration-200 font-medium"
      type="button"
    >
      Save
    </button>
  )
}

function HomePage() {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col text-light-50 h-dvh divide-y divide-dark-300">
        {/* <NavigationBarModule /> */}
        <SaveButton />

        <div className="flex grow of-y-hidden divide-x divide-dark-300">
          <div className="grow bg-dark-500 <md:(bg-dark-700)">
            <AddNodeOnEdgeDropStateProvider>
              <FlowBuilderModule />
            </AddNodeOnEdgeDropStateProvider>
          </div>

          <SidebarModule />
        </div>
      </div>

      <ToasterModule />
    </ReactFlowProvider>
  )
}
