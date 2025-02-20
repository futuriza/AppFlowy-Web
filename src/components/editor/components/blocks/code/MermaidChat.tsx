import { CustomEditor } from '@/application/slate-yjs/command';
import { CodeNode } from '@/components/editor/editor.type';
import { ThemeModeContext } from '@/components/main/useAppThemeMode';
import { Alert } from '@mui/material';
import { debounce } from 'lodash-es';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import mermaid from 'mermaid';

const lightTheme = {
  theme: 'base',
  themeVariables: {
    background: '#fff',
    primaryTextColor: '#000',
    nodeBkg: '#fff',
    nodeTextColor: '#000',
    nodeBorder: '#000',
    lineColor: '#000',
    arrowheadColor: '#000',
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
    fontSize: '14px',
    mainBkg: '#fff',
    borderColor: '#000',
    border2: '#000',
    curve: 'linear',
  },
};

const darkTheme = {
  theme: 'base',
  themeVariables: {
    background: '#1e1e1e',
    primaryTextColor: '#000',
    nodeBkg: '#1e1e1e',
    nodeTextColor: '#000',
    nodeBorder: '#000',
    lineColor: '#000',
    arrowheadColor: '#000',
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
    fontSize: '14px',
    mainBkg: '#1e1e1e',
    borderColor: '#000',
    border2: '#000',
    curve: 'linear',
  },
};

const sanitizeDiagram = (diagramText: string) => {

  const directiveRegex = /^%%{init:.*}%%/;

  if (directiveRegex.test(diagramText.trim())) {
    return diagramText;
  }

  return diagramText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .replace(/(?:javascript|data|vbscript):/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
};

function MermaidChat ({ node }: {
  node: CodeNode
}) {
  const id = node.blockId;
  const diagram = CustomEditor.getBlockTextContent(node);
  const ref = useRef<HTMLDivElement>(null);
  const [innerHtml, setInnerHtml] = React.useState<string>('');
  const isDark = useContext(ThemeModeContext)?.isDark;
  const [error, setError] = React.useState<string | null>(null);

  const updateMermaid = useCallback(async (diagram: string) => {
    const sanitizedDiagram = sanitizeDiagram(diagram);
    const theme = isDark ? darkTheme : lightTheme;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
      ...theme,
    });
    try {
      await mermaid.parse(sanitizedDiagram);
      const { svg } = await mermaid.render(`mermaid-${id}`, diagram);

      setError(null);
      setInnerHtml(svg);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setError(e.message);
    }
  }, [id, isDark]);

  const deboucenUpdateMermaid = useMemo(() => {
    return debounce(updateMermaid, 1000);
  }, [updateMermaid]);

  useEffect(() => {
    if (!diagram.trim()) {
      setError(null);
      setInnerHtml('');
      return;
    }

    void deboucenUpdateMermaid(diagram);
  }, [deboucenUpdateMermaid, diagram]);

  if (error && diagram) {
    return (
      <div
        contentEditable={false}
      >
        <Alert
          icon={false}
          variant={'outlined'}
          color={'error'}
        >{error}</Alert>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        placeContent: 'center',
      }}
      contentEditable={false}
      ref={ref}
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    />
  );
}

export default MermaidChat;