/**
 * Lightweight inline Markdown renderer.
 * Supports: **bold**, *italic*, `code`
 */

import React from 'react';

interface Segment {
  type: 'text' | 'bold' | 'italic' | 'code';
  content: string;
}

function parseInline(text: string): Segment[] {
  const segments: Segment[] = [];
  // Combined pattern. Order matters: bold before italic.
  const pattern = /\*\*(.+?)\*\*|__(.+?)__|`(.+?)`|\*(.+?)\*|_(.+?)_/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Plain text before the match
    if (match.index > cursor) {
      segments.push({ type: 'text', content: text.slice(cursor, match.index) });
    }

    if (match[1] !== undefined || match[2] !== undefined) {
      segments.push({ type: 'bold', content: match[1] ?? match[2] });
    } else if (match[3] !== undefined) {
      segments.push({ type: 'code', content: match[3] });
    } else if (match[4] !== undefined || match[5] !== undefined) {
      segments.push({ type: 'italic', content: match[4] ?? match[5] });
    }

    cursor = match.index + match[0].length;
  }

  // Remaining plain text
  if (cursor < text.length) {
    segments.push({ type: 'text', content: text.slice(cursor) });
  }

  return segments;
}

/** Drop-in component: renders a string with inline Markdown. */
export function Markdown({ children }: { children: string }) {
  const segments = parseInline(children);

  return (
    <>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'bold':
            return <strong key={i}>{seg.content}</strong>;
          case 'italic':
            return <em key={i}>{seg.content}</em>;
          case 'code':
            return (
              <code key={i} style={{ fontFamily: 'monospace', fontSize: '0.9em', background: '#f1f5f9', padding: '0.1em 0.4em', borderRadius: '4px' }}>
                {seg.content}
              </code>
            );
          default:
            return <React.Fragment key={i}>{seg.content}</React.Fragment>;
        }
      })}
    </>
  );
}
