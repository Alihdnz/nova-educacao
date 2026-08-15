/* eslint-disable @next/next/no-img-element -- lesson media uses administrator-provided remote URLs */

import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';

import { safeHttpUrl } from '@/lib/content-security';

const allowedElements = [
  'a',
  'blockquote',
  'br',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'ul',
];

function SafeLink({ href, children, title }: ComponentPropsWithoutRef<'a'>) {
  const safeHref = typeof href === 'string' ? safeHttpUrl(href) : null;

  if (!safeHref) return <span>{children}</span>;

  return (
    <a
      className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900"
      href={safeHref}
      rel="noopener noreferrer"
      target="_blank"
      title={title}
    >
      {children}
    </a>
  );
}

function SafeImage({ alt, src, title }: ComponentPropsWithoutRef<'img'>) {
  const safeSrc = typeof src === 'string' ? safeHttpUrl(src) : null;
  if (!safeSrc) return null;

  return (
    <img
      alt={alt ?? ''}
      className="my-6 max-h-[32rem] w-full rounded-md border object-contain"
      loading="lazy"
      src={safeSrc}
      title={title}
    />
  );
}

export function LessonContentRenderer({ content }: { content: string }) {
  return (
    <div className="min-w-0 text-[0.95rem] leading-7 text-foreground">
      <ReactMarkdown
        allowedElements={allowedElements}
        components={{
          a: SafeLink,
          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-4 border-sky-200 pl-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>
          ),
          h1: ({ children }) => <h1 className="mb-4 mt-8 text-2xl font-semibold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-8 text-xl font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-6 text-lg font-semibold">{children}</h3>,
          h4: ({ children }) => <h4 className="mb-2 mt-5 font-semibold">{children}</h4>,
          h5: ({ children }) => <h5 className="mb-2 mt-5 font-semibold">{children}</h5>,
          h6: ({ children }) => <h6 className="mb-2 mt-5 font-semibold">{children}</h6>,
          hr: () => <hr className="my-8 border-border" />,
          img: SafeImage,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          ol: ({ children }) => <ol className="my-4 list-decimal space-y-1 pl-6">{children}</ol>,
          p: ({ children }) => <p className="my-4 whitespace-pre-wrap">{children}</p>,
          pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto rounded-md border bg-muted p-4 text-sm">{children}</pre>
          ),
          ul: ({ children }) => <ul className="my-4 list-disc space-y-1 pl-6">{children}</ul>,
        }}
        skipHtml
        unwrapDisallowed
        urlTransform={(url) => safeHttpUrl(url) ?? ''}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
