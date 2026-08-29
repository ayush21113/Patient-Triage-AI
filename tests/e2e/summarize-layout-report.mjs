import { readFile, writeFile } from "node:fs/promises";

const [input, output, label] = process.argv.slice(2);
const report = JSON.parse(await readFile(input, "utf8"));
const rows = [];

function fieldBefore(message, index, field) {
  const matches = [...message.slice(0, index).matchAll(
    new RegExp("\\\"" + field + "\\\": \\\"([^\\\"]+)\\\"", "g")
  )];
  return matches.at(-1)?.[1] ?? "—";
}

function fieldAfter(message, index, field) {
  return message.slice(index).match(
    new RegExp("\\\"" + field + "\\\": (null|\\\"([^\\\"]+)\\\")")
  )?.[2] ?? "—";
}

function rectBefore(message, index, field) {
  const start = message.lastIndexOf("\"" + field + "\": Object {", index);
  if (start === -1) return "—";
  const source = message.slice(start, index);
  const values = Object.fromEntries(
    [...source.matchAll(
      /\"(x|y|width|height)\": (-?\d+(?:\.\d+)?)/g
    )].map(match => [match[1], match[2]])
  );
  return "[" + ["x", "y", "width", "height"].map(key =>
    values[key] ?? "?"
  ).join(", ") + "]";
}

function rectAfter(message, index, field) {
  const start = message.indexOf("\"" + field + "\": Object {", index);
  if (start === -1) return "—";
  const source = message.slice(start, start + 500);
  const values = Object.fromEntries(
    [...source.matchAll(
      /\"(x|y|width|height)\": (-?\d+(?:\.\d+)?)/g
    )].map(match => [match[1], match[2]])
  );
  return "[" + ["x", "y", "width", "height"].map(key =>
    values[key] ?? "?"
  ).join(", ") + "]";
}

for (const suite of report.suites ?? []) {
  for (const spec of suite.specs ?? []) {
    const result = spec.tests?.[0]?.results?.at(-1);
    const attachment = result?.attachments?.find(item =>
      item.name === "layout-defects" && item.body
    );
    if (attachment) {
      for (const defect of JSON.parse(
        Buffer.from(attachment.body, "base64").toString("utf8")
      )) {
        rows.push({ state: spec.title, ...defect });
      }
      continue;
    }
    const message = result?.error?.message ?? "";
    for (const match of message.matchAll(/\"rule\": \"([^\"]+)\"/g)) {
      rows.push({
        state: spec.title,
        rule: match[1],
        first: fieldBefore(message, match.index, "first"),
        firstRect: rectBefore(message, match.index, "firstRect"),
        second: fieldAfter(message, match.index, "second"),
        secondRect: rectAfter(message, match.index, "secondRect")
      });
    }
  }
}

const grouped = new Map();
for (const row of rows) {
  const group = grouped.get(row.rule) ?? {
    occurrences: 0,
    states: new Set()
  };
  group.occurrences += 1;
  group.states.add(row.state);
  grouped.set(row.rule, group);
}

function formatRect(rect) {
  if (!rect || typeof rect === "string") return rect ?? "—";
  return "[" + [rect.x, rect.y, rect.width, rect.height].join(", ") + "]";
}

const lines = [
  "# Layout integrity · " + label,
  "",
  "## Summary",
  "",
  "| Rule | Affected states | Occurrences |",
  "|---|---:|---:|",
  ...[...grouped].map(([rule, group]) =>
    "| " + rule + " | " + group.states.size + " | " +
    group.occurrences + " |"
  ),
  "",
  "## By first selector",
  "",
  "| Rule | First selector | Affected states | Occurrences |",
  "|---|---|---:|---:|",
  ...[...rows.reduce((groups, row) => {
    const key = row.rule + "|" + row.first;
    const group = groups.get(key) ?? {
      rule: row.rule,
      first: row.first,
      states: new Set(),
      occurrences: 0
    };
    group.states.add(row.state);
    group.occurrences += 1;
    groups.set(key, group);
    return groups;
  }, new Map()).values()].sort((left, right) =>
    right.occurrences - left.occurrences
  ).map(group =>
    "| " + group.rule + " | " + group.first + " | " +
    group.states.size + " | " + group.occurrences + " |"
  ),
  "",
  "## First example per state and rule",
  "",
  "| State | Rule | First selector · rect [x,y,w,h] | Second selector · rect |",
  "|---|---|---|---|"
];
const seen = new Set();
for (const row of rows) {
  const key = row.state + "|" + row.rule;
  if (seen.has(key)) continue;
  seen.add(key);
  lines.push(
    "| " + row.state + " | " + row.rule + " | " + row.first + " · " +
    formatRect(row.firstRect) + " | " + (row.second ?? "—") + " · " +
    formatRect(row.secondRect) + " |"
  );
}
if (rows.length === 0) {
  lines.push("| All surveyed states | clean | — | — |");
}
await writeFile(output, lines.join("\n") + "\n");
console.log(rows.length + " defects across " + seen.size +
  " state/rule groups");
