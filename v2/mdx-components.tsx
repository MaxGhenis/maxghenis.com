import type { MDXComponents } from "mdx/types";
import type { HTMLAttributes, TableHTMLAttributes } from "react";

const Table = (props: TableHTMLAttributes<HTMLTableElement>) => (
  <div className="my-8 overflow-x-auto">
    <table
      {...props}
      className={`w-full border-collapse text-sm tabular ${props.className ?? ""}`}
    />
  </div>
);

const Th = (props: HTMLAttributes<HTMLTableCellElement>) => (
  <th
    {...props}
    className={`border-b-2 border-[color:var(--mg-ink)] bg-[color:var(--mg-rule-soft)] px-3 py-2 text-left font-semibold ${props.className ?? ""}`}
  />
);

const Td = (props: HTMLAttributes<HTMLTableCellElement>) => (
  <td
    {...props}
    className={`border-b border-[color:var(--mg-rule)] px-3 py-2 ${props.className ?? ""}`}
  />
);

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    table: Table,
    th: Th,
    td: Td,
    ...components,
  };
}
