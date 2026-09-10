import type { Vec2 } from "./math";
export class SpatialGrid<T extends Vec2> {
  private cells = new Map<string, T[]>();
  constructor(private size = 64) {}
  rebuild(items: readonly T[]) {
    this.cells.clear();
    for (const item of items) {
      const key = `${Math.floor(item.x / this.size)},${Math.floor(item.y / this.size)}`;
      const bucket = this.cells.get(key);
      if (bucket) bucket.push(item);
      else this.cells.set(key, [item]);
    }
  }
  query(x: number, y: number, radius: number): T[] {
    const found: T[] = [];
    for (
      let cx = Math.floor((x - radius) / this.size);
      cx <= Math.floor((x + radius) / this.size);
      cx++
    )
      for (
        let cy = Math.floor((y - radius) / this.size);
        cy <= Math.floor((y + radius) / this.size);
        cy++
      ) {
        const bucket = this.cells.get(`${cx},${cy}`);
        if (bucket) for (const item of bucket) found.push(item);
      }
    return found;
  }
}
