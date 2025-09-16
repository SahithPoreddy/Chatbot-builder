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
  SaveDrawingPayload,
  SaveDrawingMessage,
} from '~/types/open-webui.types'

// Import SVG export utility
import { captureDiagramAsSVG } from '~/utils/svg-export'

export const Route = createFileRoute('/')({
  component: HomePage,
})



function HomePage() {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col text-light-50 h-dvh divide-y divide-dark-300">
        {/* <NavigationBarModule /> */}
        {/* SaveButton removed */}
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
