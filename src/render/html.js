function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function escapeScriptJson(value) {
  return String(value || "")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function jsonScript(value) {
  return escapeScriptJson(JSON.stringify(value));
}

function listItems(items, className = "") {
  const body = (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<ul${className ? ` class="${escapeAttribute(className)}"` : ""}>${body}</ul>`;
}

function icon(name) {
  return `<i data-lucide="${escapeAttribute(name)}" aria-hidden="true"></i>`;
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const html = [];
  let listOpen = false;
  let listTag = "ul";

  function closeList() {
    if (listOpen) {
      html.push(`</${listTag}>`);
      listOpen = false;
    }
  }

  function splitTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  }

  function isTableSeparator(line) {
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
  }

  function isTableRow(line) {
    return /^\|.+\|$/.test(line.trim());
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    if (isTableRow(line) && lines[index + 1] && isTableSeparator(lines[index + 1])) {
      closeList();
      const headers = splitTableRow(line);
      index += 2;
      const rows = [];
      while (index < lines.length && isTableRow(lines[index])) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      index -= 1;
      html.push(
        `<div class="table-scroll"><table><thead><tr>${headers
          .map((header) => `<th>${inlineMarkdownToHtml(header)}</th>`)
          .join("")}</tr></thead><tbody>${rows
          .map(
            (row) =>
              `<tr>${headers
                .map((_, cellIndex) => `<td>${inlineMarkdownToHtml(row[cellIndex] || "")}</td>`)
                .join("")}</tr>`,
          )
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${inlineMarkdownToHtml(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${inlineMarkdownToHtml(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      html.push(`<h1>${inlineMarkdownToHtml(line.slice(2))}</h1>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!listOpen || listTag !== "ul") {
        closeList();
        listTag = "ul";
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdownToHtml(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!listOpen || listTag !== "ol") {
        closeList();
        listTag = "ol";
        html.push("<ol>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdownToHtml(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    if (listOpen && /^\s+/.test(rawLine) && html.length) {
      html[html.length - 1] = html[html.length - 1].replace(
        /<\/li>$/,
        `<br>${inlineMarkdownToHtml(line)}</li>`,
      );
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdownToHtml(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}

function inlineMarkdownToHtml(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+|#[^)\s]+)\)/g, (_match, label, href) => {
      return `<a href="${escapeAttribute(href)}">${escapeHtml(label)}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

module.exports = {
  escapeAttribute,
  escapeHtml,
  escapeScriptJson,
  icon,
  inlineMarkdownToHtml,
  jsonScript,
  listItems,
  markdownToHtml,
};
