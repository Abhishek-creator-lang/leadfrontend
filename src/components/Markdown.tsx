'use client';

import { memo, useEffect, useId, useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Box, useTheme } from '@mui/material';
import { useModeColors } from '@/hooks/useModeColors';
import { isExternalUrl } from './ExternalLink';
import 'highlight.js/styles/github-dark.css';

function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, '');
  const theme = useTheme();
  const [svg, setSvg] = useState<string>('');
  useEffect(() => {
    let alive = true;
    import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme.palette.mode === 'dark' ? 'dark' : 'neutral',
      });
      try {
        const { svg } = await mermaid.render(`m${id}`, chart);
        if (alive) setSvg(svg);
      } catch {
        if (alive) setSvg(`<pre>${chart.replace(/</g, '&lt;')}</pre>`);
      }
    });
    return () => {
      alive = false;
    };
  }, [chart, id, theme.palette.mode]);
  return (
    <Box
      sx={{ my: 2, textAlign: 'center', '& svg': { maxWidth: '100%', height: 'auto' } }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const components: Components = {
  code({ className, children, ...rest }) {
    if (/language-mermaid/.test(className ?? ''))
      return <Mermaid chart={String(children).trim()} />;
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
  pre({ children, node, ...rest }) {
    const first = node?.children?.[0];
    const isMermaid =
      first &&
      'properties' in first &&
      String((first.properties?.className as string[] | undefined)?.join(' ')).includes('mermaid');
    return isMermaid ? <>{children}</> : <pre {...rest}>{children}</pre>;
  },
  a({ href, children, ...rest }) {
    return (
      <a
        href={href}
        {...rest}
        {...(isExternalUrl(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {children}
      </a>
    );
  },
};

function MarkdownImpl({ children }: { children: string }) {
  const mc = useModeColors();
  return (
    <Box
      className="markdown"
      sx={{
        fontSize: 15,
        lineHeight: 1.7,
        color: 'text.primary',
        wordBreak: 'break-word',
        '& h1, & h2, & h3, & h4': { fontWeight: 700, lineHeight: 1.3, mt: 3, mb: 1.5 },
        '& h1': { fontSize: 28 },
        '& h2': { fontSize: 22, pb: 0.75, borderBottom: `1px solid ${mc.borderLight}` },
        '& h3': { fontSize: 18 },
        '& h4': { fontSize: 16 },
        '& > :first-of-type': { mt: 0 },
        '& p, & ul, & ol, & table, & blockquote': { my: 1.5 },
        '& ul, & ol': { pl: 3 },
        '& li + li': { mt: 0.5 },
        '& a': { color: 'primary.main' },
        '& pre': {
          background: '#0D1117',
          color: '#E6EDF3',
          p: 2,
          borderRadius: 2,
          overflowX: 'auto',
          fontSize: 13.5,
          lineHeight: 1.6,
        },
        '& pre code': {
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          background: 'none',
          p: 0,
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          display: 'block',
          overflowX: 'auto',
        },
        '& th, & td': {
          border: `1px solid ${mc.borderLight}`,
          px: 1.5,
          py: 1,
          textAlign: 'left',
          verticalAlign: 'top',
        },
        '& th': { background: mc.bgSubtle, fontWeight: 600 },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          background: mc.bgSubtle,
          m: 0,
          px: 2,
          py: 1,
          borderRadius: 1,
        },
        '& img': { maxWidth: '100%' },
        '& hr': { border: 0, borderTop: `1px solid ${mc.borderLight}`, my: 3 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
}

export const Markdown = memo(MarkdownImpl);
