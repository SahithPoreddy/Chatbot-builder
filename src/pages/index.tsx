import { createFileRoute } from '@tanstack/react-router'
import { ReactFlowProvider, useReactFlow } from '@xyflow/react'

import { FlowBuilderModule } from '~/modules/flow-builder/flow-builder-module'
// import { NavigationBarModule } from '~/modules/navigation-bar/navigation-bar-module'
import { SidebarModule } from '~/modules/sidebar/sidebar-module'
import { ToasterModule } from '~/modules/toaster/toaster-module'
import { AddNodeOnEdgeDropStateProvider } from '~/stores/add-node-on-edge-drop-state'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function SaveButton() {
  const { getNodes, getEdges } = useReactFlow()

  const handleSave = () => {
    const nodes = getNodes()
    const edges = getEdges()

    const drawingData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        data: edge.data,
      })),
      timestamp: Date.now()
    }

    console.log('📤 Sending data to parent:')
    console.log('Raw JSON data:', JSON.stringify(drawingData, null, 2))
    console.log('📊 Data summary:')
    console.log('- Nodes count:', drawingData.nodes.length)
    console.log('- Edges count:', drawingData.edges.length)
    console.log('- Timestamp:', new Date(drawingData.timestamp).toLocaleString())

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

    // Send the message to the parent window (matching the format expected by postMessage handler)
    window.parent.postMessage({
      type: 'saveDrawing',
      payload: drawingData  // Send as object, not stringified
    }, 'http://localhost:5173')

    console.log('✅ Data sent to parent successfully')
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
