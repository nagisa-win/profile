/**
 * 配置合并：把内网版（over）叠加到公开版（base）上，返回新对象，不修改入参。
 * - 普通对象：递归合并，over 优先
 * - 元素都带 id 的数组：按 id 合并；新 id 插到「后面第一个已存在的 id」之前，没有则追加到末尾
 * - 其他数组与基础类型：整体替换
 */
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const hasIds = (a) => a.length > 0 && a.every((x) => isObj(x) && typeof x.id === 'string');

export function merge(base, over) {
  if (over === undefined) return structuredClone(base);
  if (isObj(base) && isObj(over)) {
    const out = structuredClone(base);
    for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
    return out;
  }
  if (Array.isArray(base) && Array.isArray(over) && hasIds(base) && hasIds(over)) {
    const out = structuredClone(base);
    over.forEach((item, i) => {
      const at = out.findIndex((x) => x.id === item.id);
      if (at >= 0) { out[at] = merge(out[at], item); return; }
      /** 新条目：找 over 里排在它后面、且 base 已有的条目，插到它前面 */
      const anchor = over.slice(i + 1).map((x) => out.findIndex((y) => y.id === x.id)).find((n) => n >= 0);
      if (anchor === undefined) out.push(structuredClone(item));
      else out.splice(anchor, 0, structuredClone(item));
    });
    return out;
  }
  return structuredClone(over);
}
