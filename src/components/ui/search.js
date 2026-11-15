// Filtering for the shared search overlay: groups first, items inside.
// A group survives when its label (or a keyword) matches or one of its items does; an item survives
// when its label (or a keyword) matches. A matching group label keeps every item, so a whole section
// can be found by its name. A prefix with one mistyped last letter still matches, so "vit" finds
// "Vision" while the word is being typed.

export function normalize(value) {
  return String(value == null ? "" : value).trim().toLowerCase();
}

function matches(text, needle) {
  const value = normalize(text);
  if (!needle || !value) return false;
  if (value.includes(needle)) return true;
  const tokens = needle.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) return tokens.every((token) => value.includes(token));
  return needle.length >= 3 && value.startsWith(needle.slice(0, -1));
}

function anyMatch(values, needle) {
  return Array.isArray(values) && values.some((value) => matches(value, needle));
}

export function filterGroups(groups, query) {
  const needle = normalize(query);
  const list = Array.isArray(groups) ? groups : [];
  if (!needle) {
    return list.map((group) => ({
      ...group,
      items: Array.isArray(group.items) ? group.items : [],
      labelMatch: false
    }));
  }
  const found = [];
  for (const group of list) {
    const items = Array.isArray(group.items) ? group.items : [];
    const labelMatch = matches(group.label, needle) || anyMatch(group.keywords, needle);
    const itemMatches = items.filter((item) =>
      matches(item.label, needle) || anyMatch(item.keywords, needle));
    if (!labelMatch && !itemMatches.length) continue;
    found.push({
      ...group,
      items: labelMatch ? items : itemMatches,
      labelMatch
    });
  }
  return found;
}

export function visibleItems(groups, isExpanded) {
  const visible = [];
  for (const group of groups) {
    if (!isExpanded(group)) continue;
    for (const item of group.items) visible.push({ group, item });
  }
  return visible;
}

export function stepIndex(index, delta, length) {
  if (length <= 0) return 0;
  return (index + delta + length) % length;
}
