import type { ImportRow } from "@/lib/types";

export function csvEscape(value: string): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function parseCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  out.push(current);
  return out.map((s) => s.trim());
}

export function detectDelimiter(sample: string): string {
  const candidates = [",", ";", "|", "\t"];
  const scores = candidates.map((d) => ({
    d,
    count: (sample.match(new RegExp(d === "\t" ? "\t" : `\\${d}`, "g")) || [])
      .length,
  }));

  scores.sort((a, b) => b.count - a.count);
  return scores[0].count > 0 ? scores[0].d : ",";
}

export function splitCsvRows(text: string): string[] {
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '""';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += ch;
      }
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      if (current.trim()) rows.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  if (current.trim()) rows.push(current);
  return rows;
}

export function parseImportText(text: string): ImportRow[] {
  const raw = text.trim();
  if (!raw) return [];

  // Try JSON first
  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return (arr as Record<string, unknown>[])
        .filter((o) => typeof o === "object" && o !== null)
        .map((o, i) => ({
          uid: `row-${Date.now()}-${i}`,
          title: String(o.title ?? o.name ?? "").trim(),
          email: String(
            o.email ?? o.username ?? o.login ?? o["account"] ?? ""
          ).trim(),
          password: String(o.password ?? "").trim(),
          url: String(o.url ?? o.link ?? "").trim(),
          description: String(o.description ?? o.note ?? "").trim(),
          category: String(o.category ?? o.cat ?? "").trim(),
        }))
        .filter((r) => r.email || r.password || r.title);
    } catch {
      // Fall through to CSV parsing
    }
  }

  // Parse as CSV
  const rows = splitCsvRows(raw);
  if (rows.length === 0) return [];

  const headerLower = rows[0].toLowerCase();
  const hasHeader =
    (headerLower.includes("title") &&
      (headerLower.includes("email") ||
        headerLower.includes("login") ||
        headerLower.includes("username") ||
        headerLower.includes("account"))) ||
    (headerLower.includes("account") && headerLower.includes("password"));

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const delimiter = hasHeader
    ? detectDelimiter(rows[0])
    : detectDelimiter(dataRows[0] || ",");

  return dataRows
    .map((line, i) => {
      const parts = parseCsvLine(line, delimiter);

      let title = "",
        email = "",
        password = "",
        url = "",
        description = "",
        category = "";

      if (parts.length === 2) {
        [email, password] = parts;
      } else if (parts.length === 3) {
        if (parts[2].includes(".") || parts[2].startsWith("http")) {
          [email, password, url] = parts;
        } else {
          [title, email, password] = parts;
        }
      } else if (parts.length >= 6) {
        [title, email, password, url, description, category] = [
          ...parts,
          "",
          "",
          "",
          "",
          "",
          "",
        ].slice(0, 6);
        if (parts.length > 6) category = parts[5] ?? "";
      } else {
        [title = "", email = "", password = "", url = "", description = ""] = [
          ...parts,
          "",
          "",
          "",
          "",
        ].slice(0, 5);
        if (
          parts.length === 4 &&
          !title.includes(" ") &&
          email &&
          password &&
          url
        ) {
          [email, password, url, description] = parts as [
            string,
            string,
            string,
            string
          ];
          title = "";
        }
      }

      return {
        uid: `row-${Date.now()}-${i}`,
        title: title.trim(),
        email: email.trim(),
        password,
        url: url.trim(),
        description: description.trim(),
        category: category.trim(),
      };
    })
    .filter((r) => r.email || r.password || r.title);
}
