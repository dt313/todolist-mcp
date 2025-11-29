// components/markdown-message.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownMessage({ content, role = "assistant" }) {
  const isUser = role === "user";

  return (
    <div className={`flex flex-1 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`block rounded-lg px-3 py-1 w-fit max-w-[100%] whitespace-pre-wrap ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ node, ...props }) => (
              <table
                className="border-collapse border border-gray-300 dark:border-gray-700 w-full text-sm"
                {...props}
              />
            ),
            th: ({ node, ...props }) => (
              <th
                className="border border-gray-300 dark:border-gray-700 px-2 py-1 bg-gray-100 dark:bg-gray-800"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className="border border-gray-300 dark:border-gray-700 px-2 py-1"
                {...props}
              />
            ),
            code: ({ node, inline, className, children, ...props }) =>
              inline ? (
                <code
                  className="bg-gray-200 dark:bg-gray-700 px-1 rounded"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <pre
                  className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto"
                  {...props}
                >
                  <code>{children}</code>
                </pre>
              ),

            // 🌟 Thêm style cho các thẻ Markdown khác
            p: ({ node, children, ...props }) => {
              // Nếu p chứa code block thì render div
              const hasPre = node.children.some(
                (child) => child.type === "element" && child.tagName === "pre"
              );

              if (hasPre) {
                return (
                  <div className="leading-relaxed" {...props}>
                    {children}
                  </div>
                );
              }

              return (
                <p className="leading-relaxed" {...props}>
                  {children}
                </p>
              );
            },

            h1: ({ node, ...props }) => (
              <h1 className="text-3xl font-bold " {...props} />
            ),

            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-semibold" {...props} />
            ),

            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold" {...props} />
            ),

            ul: ({ node, ...props }) => (
              <ul className="list-disc ml-6" {...props} />
            ),

            ol: ({ node, ...props }) => (
              <ol className="list-decimal ml-6 " {...props} />
            ),

            li: ({ node, ...props }) => <li className="my-1" {...props} />,

            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-gray-400 dark:border-gray-600 pl-3 italic text-gray-700 dark:text-gray-300 my-3"
                {...props}
              />
            ),

            hr: ({ node, ...props }) => (
              <hr
                className="my-4 border-gray-300 dark:border-gray-700"
                {...props}
              />
            ),

            img: ({ node, ...props }) => (
              <img
                className="max-w-full rounded-lg my-2"
                loading="lazy"
                {...props}
              />
            ),

            a: ({ node, ...props }) => (
              <a
                className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
