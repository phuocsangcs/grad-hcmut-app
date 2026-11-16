/**
 * Phép chiếu "camera nghiêng" cho bản đồ 2.5D vẽ bằng SVG.
 * - theta: xoay mặt bằng quanh tâm (độ), tilt: góc nghiêng camera (0 = nhìn thẳng từ trên, 2D).
 * - Điểm mặt bằng (x, y) ở độ cao z → toạ độ màn hình (X, Y).
 */
export type View = { theta: number; tilt: number };
export type Pt = [number, number];

/** Chiều cao một tầng (đơn vị mặt bằng). */
export const FLOOR = 9;
export const CENTER: Pt = [520, 320];

export function makeProjector({ theta, tilt }: View) {
  const a = (theta * Math.PI) / 180;
  const t = (tilt * Math.PI) / 180;
  const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(t), st = Math.sin(t);
  /** Xoay quanh tâm, chưa chiếu: dùng để xét mặt nào hướng về camera và sắp xếp độ sâu. */
  const rot = (x: number, y: number): Pt => {
    const dx = x - CENTER[0], dy = y - CENTER[1];
    return [dx * ca - dy * sa, dx * sa + dy * ca];
  };
  const project = (x: number, y: number, z = 0): Pt => {
    const [rx, ry] = rot(x, y);
    return [rx, ry * ct - z * st];
  };
  return { rot, project, ct, st, ca, sa };
}

export type Projector = ReturnType<typeof makeProjector>;

export const pts = (list: Pt[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export type Face = { points: string; shade: number; key: string };

/**
 * Các mặt nhìn thấy của một hộp (x, y, w, d, chiều cao h): tường hướng về camera + nóc.
 * shade: 0 (sáng) → 1 (tối), template tô màu theo đó.
 */
export function boxFaces(P: Projector, x: number, y: number, w: number, d: number, h: number, lift = 0): { walls: (Face & { base: Pt[]; top: Pt[] })[]; top: Face; depth: number } {
  const c: Pt[] = [
    [x, y],
    [x + w, y],
    [x + w, y + d],
    [x, y + d],
  ];
  // Pháp tuyến ra ngoài của 4 tường (mặt bằng): Bắc, Đông, Nam, Tây.
  const normals: Pt[] = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  const walls: (Face & { base: Pt[]; top: Pt[] })[] = [];
  if (P.st > 0.02 && h > 0) {
    for (let i = 0; i < 4; i++) {
      const [nx, ny] = normals[i];
      const rnx = nx * P.ca - ny * P.sa;
      const rny = nx * P.sa + ny * P.ca;
      if (rny <= 0.001) continue; // quay lưng với camera
      const a = c[i], b = c[(i + 1) % 4];
      const base = [P.project(a[0], a[1], lift), P.project(b[0], b[1], lift)];
      const top = [P.project(b[0], b[1], lift + h), P.project(a[0], a[1], lift + h)];
      // Ánh sáng từ trái-trên: tường hướng sang phải tối hơn một chút.
      walls.push({ key: `w${i}`, points: pts([...base, ...top]), shade: 0.35 + Math.max(0, rnx) * 0.35 + (1 - rny) * 0.1, base, top: [top[1], top[0]] });
    }
  }
  const topPts = c.map(([px, py]) => P.project(px, py, lift + h));
  // Độ sâu: điểm xa camera nhất ở phía trước (y sau khi xoay lớn hơn = gần camera hơn).
  const depth = Math.max(...c.map(([px, py]) => P.rot(px, py)[1]));
  return { walls, top: { key: 'top', points: pts(topPts), shade: 0 }, depth };
}

/** Khung bao của tập điểm đã chiếu (để đặt viewBox). */
export function bounds(list: Pt[], pad: number) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of list) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
}
