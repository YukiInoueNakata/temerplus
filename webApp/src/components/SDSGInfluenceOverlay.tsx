// ============================================================================
// SDSGInfluenceOverlay - 幅を持つ SD/SG から影響先の各 Box へ引く太い矢印
// - 計算は utils/sdsgInfluence（SVG / PPTX 出力と共用）
// - キャンバス座標 → 画面座標は React Flow の transform で変換。操作は受け付けない
// ============================================================================

import { useMemo } from 'react';
import { useStore as useReactFlowStore } from 'reactflow';
import { useTEMView } from '../context/TEMViewContext';
import { collectInfluenceSegments } from '../utils/sdsgInfluence';

export function SDSGInfluenceOverlay() {
  const view = useTEMView();
  const sheet = view.sheet;
  const settings = view.settings;
  const transform = useReactFlowStore((s) => s.transform);

  const segments = useMemo(
    () => (sheet ? collectInfluenceSegments(sheet, settings.layout, settings) : []),
    [sheet, settings],
  );
  if (segments.length === 0) return null;

  const [panX, panY, zoom] = transform;
  const sx = (x: number) => x * zoom + panX;
  const sy = (y: number) => y * zoom + panY;

  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
      <defs>
        {segments.map((s) => (
          <marker
            key={`m-${s.sdsgId}-${s.boxId}`}
            id={`influence-head-${s.sdsgId}-${s.boxId}`}
            viewBox="0 0 10 10"
            refX="9" refY="5"
            markerWidth={4} markerHeight={4}
            orient="auto-start-reverse"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={s.color} />
          </marker>
        ))}
      </defs>
      {segments.map((s) => (
        <line
          key={`${s.sdsgId}-${s.boxId}`}
          x1={sx(s.x1)} y1={sy(s.y1)} x2={sx(s.x2)} y2={sy(s.y2)}
          stroke={s.color}
          strokeWidth={s.strokeWidth * zoom}
          strokeLinecap="butt"
          markerEnd={`url(#influence-head-${s.sdsgId}-${s.boxId})`}
        />
      ))}
    </svg>
  );
}
