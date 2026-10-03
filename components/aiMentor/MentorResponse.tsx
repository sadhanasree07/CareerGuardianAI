"use client";

import { useState } from "react";
import { Bot, Copy, CheckCircle2 } from "lucide-react";

function inlineContent(text: string, keyPrefix: string) {
  const tokenPattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;
    if (token.startsWith("**")) nodes.push(<strong key={key} className="font-bold text-slate-900">{token.slice(2, -2)}</strong>);
    else if (token.startsWith("*")) nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    else if (token.startsWith("`")) nodes.push(<code key={key} className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">{token.slice(1, -1)}</code>);
    else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const href = link?.[2] || "";
      if (link && /^https?:\/\//i.test(href)) nodes.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer" className="break-all text-blue-700 underline decoration-transparent underline-offset-2 hover:decoration-current">{link[1]}</a>);
      else nodes.push(link?.[1] || token);
    }
    cursor = match.index + token.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function cleanCopyText(markdown: string) {
  return markdown
    .replace(/```[^\n]*\n?/g, "").replace(/```/g, "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "").replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ").replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*|__|`/g, "").replace(/(?<!\*)\*(?!\*)|(?<!_)_(?!_)/g, "")
    .replace(/^\s*>\s?/gm, "").replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, "")
    .replace(/^\s*\|/gm, "").replace(/\|\s*$/gm, "").replace(/\|/g, "  ·  ")
    .replace(/\n{3,}/g, "\n\n").trim();
}

function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockNumber = 0;
  const key = () => `mentor-block-${blockNumber++}`;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { i++; continue; }

    if (/^```/.test(trimmed)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      if (i < lines.length) i++;
      blocks.push(<pre key={key()} className="my-4 max-w-full overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100"><code>{code.join("\n")}</code></pre>);
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key()} className="my-6 border-slate-200" />); i++; continue;
    }

    const tableSeparator = i + 1 < lines.length && /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1]);
    if (line.includes("|") && tableSeparator) {
      const cells = (value: string) => value.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
      const headers = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(cells(lines[i++]));
      blocks.push(<div key={key()} className="my-4 max-w-full overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-full border-collapse text-left text-sm"><thead className="bg-blue-50"><tr>{headers.map((cell, index) => <th key={index} className="whitespace-nowrap px-4 py-3 font-bold text-slate-800">{inlineContent(cell, `th-${blockNumber}-${index}`)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-slate-200">{headers.map((_, index) => <td key={index} className="px-4 py-3 align-top text-slate-700">{inlineContent(row[index] || "", `td-${blockNumber}-${rowIndex}-${index}`)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2].replace(/\*\*/g, "");
      const numbered = /^(\d{1,2})[.)]\s+(.+)$/.exec(title);
      const content = numbered ? numbered[2] : title;
      const cls = level === 1
        ? "mb-4 mt-1 text-2xl font-extrabold leading-tight text-slate-950 sm:text-[26px]"
        : level === 2
          ? "mb-3 mt-7 text-xl font-extrabold leading-snug text-slate-900"
          : "mb-2 mt-5 text-base font-bold leading-snug text-blue-900 sm:text-lg";
      blocks.push(<div key={key()} className={numbered ? "mb-3 mt-7 flex items-start gap-3" : ""}>{numbered && <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-800">{numbered[1].padStart(2, "0")}</span>}{level === 1 ? <h1 className={cls}>{inlineContent(content, `h-${blockNumber}`)}</h1> : level === 2 ? <h2 className={cls}>{inlineContent(content, `h-${blockNumber}`)}</h2> : level === 3 ? <h3 className={cls}>{inlineContent(content, `h-${blockNumber}`)}</h3> : level === 4 ? <h4 className={cls}>{inlineContent(content, `h-${blockNumber}`)}</h4> : level === 5 ? <h5 className={cls}>{inlineContent(content, `h-${blockNumber}`)}</h5> : <h6 className={cls}>{inlineContent(content, `h-${blockNumber}`)}</h6>}</div>);
      i++; continue;
    }

    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push(<blockquote key={key()} className="my-4 border-l-4 border-blue-300 pl-4 italic leading-7 text-slate-600">{quote.map((part, index) => <p key={index}>{inlineContent(part, `q-${blockNumber}-${index}`)}</p>)}</blockquote>);
      continue;
    }

    const listMatch = /^\s*([-*+] |\d+[.)] )/.exec(line);
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1]);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+] |\d+[.)] )/.test(lines[i])) items.push(lines[i++].replace(/^\s*(?:[-*+] |\d+[.)] )/, ""));
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={key()} className={`my-3 space-y-2 pl-6 text-[15px] leading-7 text-slate-700 marker:text-blue-600 sm:text-base ${ordered ? "list-decimal" : "list-disc"}`}>{items.map((item, index) => <li key={index} className="break-words pl-1">{inlineContent(item, `li-${blockNumber}-${index}`)}</li>)}</List>);
      continue;
    }

    const paragraph: string[] = [trimmed];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(?:\s*#{1,6}\s|\s*[-*+] |\s*\d+[.)] |\s*>|\s*```)/.test(lines[i]) && !/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) paragraph.push(lines[i++].trim());
    const paragraphText = paragraph.join(" ");
    const title = blocks.length === 0 && /^\*\*(.+)\*\*$/.exec(paragraphText);
    blocks.push(title
      ? <h1 key={key()} className="mb-4 mt-1 text-2xl font-extrabold leading-tight text-slate-950 sm:text-[26px]">{inlineContent(title[1], `title-${blockNumber}`)}</h1>
      : <p key={key()} className="my-3 break-words text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-7">{inlineContent(paragraphText, `p-${blockNumber}`)}</p>);
  }
  return blocks;
}

export default function MentorResponse({ answer }: { answer: string }) {
  const [copied, setCopied] = useState(false);

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(cleanCopyText(answer));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-xl sm:p-8" aria-labelledby="mentor-response-title">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-100 p-3"><Bot className="h-7 w-7 text-blue-600" /></div><div><h2 id="mentor-response-title" className="text-xl font-extrabold text-slate-950 sm:text-2xl">AI Mentor Response</h2><p className="mt-0.5 text-sm text-slate-500">CareerGuardian AI</p></div></div>
        {answer && <button type="button" onClick={copyAnswer} className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">{copied ? <><CheckCircle2 className="h-5 w-5 text-green-600" />Copied</> : <><Copy className="h-5 w-5" />Copy</>}</button>}
      </div>
      <div className="mt-5 min-h-32 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-6">
        {answer ? <article className="mx-auto max-w-3xl break-words">{renderMarkdown(answer)}</article> : <div className="flex min-h-24 items-center justify-center text-center text-sm leading-6 text-slate-500 sm:text-base">Ask Guardian AI about your career path, skills, projects, interviews or placement preparation.</div>}
      </div>
    </section>
  );
}
