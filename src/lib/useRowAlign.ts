import { useLayoutEffect, type RefObject } from "react";

/*
 * Product names wrap differently per language and width. Within each visual row of tiles,
 * give every name the height of the tallest one so prices, terms and links share one baseline.
 */
export function useRowAlign(list: RefObject<HTMLElement | null>, selector = ".hd-tile__body h3", deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = list.current;
    if (!root) return;
    let frame = 0;
    const align = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const names = [...root.querySelectorAll<HTMLElement>(selector)];
        names.forEach((name) => { name.style.minHeight = ""; });
        const rows = new Map<number, HTMLElement[]>();
        names.forEach((name) => {
          const top = Math.round((name.closest("li") ?? name).getBoundingClientRect().top);
          rows.set(top, [...(rows.get(top) ?? []), name]);
        });
        rows.forEach((row) => {
          if (row.length < 2) return;
          const tallest = Math.max(...row.map((name) => name.getBoundingClientRect().height));
          row.forEach((name) => { name.style.minHeight = `${tallest}px`; });
        });
      });
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(root);
    document.fonts?.ready.then(align).catch(() => undefined);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
