import { FlowNode } from "./OrchestratorShowcase.types";

interface OrchestratorDiagramProps {
  nodes: FlowNode[];
  selectedNode?: string | null;
  onNodeSelect?: (id: string) => void;
}

export function OrchestratorDiagram({ nodes, selectedNode, onNodeSelect }: OrchestratorDiagramProps) {
  return (
    <div className="rounded-[2rem] bg-bg-base p-4 shadow-neu-sunken-l2 md:p-6 overflow-visible blueprint-layer">
      <svg
        viewBox="0 0 720 336"
        className="h-full w-full"
        role="img"
        aria-label="Payment orchestration flow diagram"
      >
        <defs>
          <linearGradient id="flowLine" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d="M 180 168 C 230 168, 250 168, 300 168"
          fill="none"
          stroke="url(#flowLine)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="8 12"
          className="animate-connectorDash"
        />
        <path
          d="M 420 168 C 470 168, 490 168, 540 168"
          fill="none"
          stroke="url(#flowLine)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="8 12"
          className="animate-connectorDash"
        />

        <path
          d="M 360 92 C 360 58, 360 58, 360 38"
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity="0.35"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 10"
          className="animate-connectorDash"
        />
        <path
          d="M 360 244 C 360 278, 360 278, 360 298"
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity="0.35"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 10"
          className="animate-connectorDash"
        />

        <rect
          x="280"
          y="18"
          width="160"
          height="42"
          rx="21"
          fill="var(--color-bg-elevated)"
          stroke="var(--color-border)"
          strokeOpacity="0.45"
        />
        <text
          x="360"
          y="35"
          textAnchor="middle"
          className="fill-current text-[12px] font-semibold uppercase tracking-[0.18em] text-content-secondary"
          style={{ fill: "var(--color-text-secondary)" }}
        >
          Fiat + Crypto rails
        </text>
        <text
          x="360"
          y="50"
          textAnchor="middle"
          className="fill-current text-[11px]"
          style={{ fill: "var(--color-text-muted)" }}
        >
          Deposits normalize into escrow-safe instructions
        </text>

        <rect
          x="268"
          y="276"
          width="184"
          height="42"
          rx="21"
          fill="var(--color-bg-elevated)"
          stroke="var(--color-border)"
          strokeOpacity="0.45"
        />
        <text
          x="360"
          y="293"
          textAnchor="middle"
          className="fill-current text-[12px] font-semibold uppercase tracking-[0.18em] text-content-secondary"
          style={{ fill: "var(--color-text-secondary)" }}
        >
          SDK state machine
        </text>
        <text
          x="360"
          y="308"
          textAnchor="middle"
          className="fill-current text-[11px]"
          style={{ fill: "var(--color-text-muted)" }}
        >
          prepare() {"->"} authorize() {"->"} finalize()
        </text>

        {nodes.map((node) => (
          <g key={node.id} onClick={() => onNodeSelect?.(node.id)} className={onNodeSelect ? "cursor-pointer" : ""}>
            <circle cx={node.x} cy={node.y} r="66" fill="url(#nodeGlow)" className="animate-blockchainPulse" />
            <circle
              cx={node.x}
              cy={node.y}
              r="58"
              fill={selectedNode === node.id ? "var(--color-primary-muted)" : "var(--color-bg-elevated)"}
              stroke={selectedNode === node.id ? "var(--color-primary)" : "var(--color-border)"}
              strokeOpacity="0.45"
              strokeWidth="2"
              style={{
                filter:
                  "drop-shadow(10px 10px 16px var(--shadow-dark)) drop-shadow(-10px -10px 16px var(--shadow-light))",
              }}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="42"
              fill="var(--color-bg-base)"
              stroke="var(--color-border)"
              strokeOpacity="0.2"
            />
            <text
              x={node.x}
              y={node.y - 4}
              textAnchor="middle"
              className="fill-current text-[14px] font-semibold"
              style={{ fill: "var(--color-text-primary)" }}
            >
              {node.label}
            </text>
            <text
              x={node.x}
              y={node.y + 16}
              textAnchor="middle"
              className="fill-current text-[11px]"
              style={{ fill: "var(--color-text-secondary)" }}
            >
              {node.sublabel}
            </text>
          </g>
        ))}

        <g>
          <text
            x="240"
            y="150"
            textAnchor="middle"
            className="fill-current text-[11px] font-medium"
            style={{ fill: "var(--color-primary)" }}
          >
            prepare()
          </text>
          <text
            x="480"
            y="150"
            textAnchor="middle"
            className="fill-current text-[11px] font-medium"
            style={{ fill: "var(--color-primary)" }}
          >
            authorize()
          </text>
          <text
            x="600"
            y="246"
            textAnchor="middle"
            className="fill-current text-[11px] font-medium"
            style={{ fill: "var(--color-primary)" }}
          >
            finalize()
          </text>
          <path
            d="M 600 226 C 600 246, 600 246, 600 262"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeOpacity="0.35"
            strokeLinecap="round"
            strokeDasharray="6 10"
            className="animate-connectorDash"
          />
        </g>
      </svg>
    </div>
  );
}
