/**
 * Normalize Tiptap HTML output for storage. Returns null when the document has no
 * visible text content (e.g. '', '<p></p>', '<p><br></p>', '<p>&nbsp;</p>'),
 * otherwise returns the HTML unchanged.
 */
export function htmlToStored(html: string): string | null {
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length === 0 ? null : html;
}
