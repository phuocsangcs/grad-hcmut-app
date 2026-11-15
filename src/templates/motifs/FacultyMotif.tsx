import type { FacultyMotif as MotifId } from '@/modules/content';
import { cx } from '@/ui';
import s from './FacultyMotif.module.css';

/**
 * Hình vẽ nét đặc trưng của từng khoa, khung 346×270.
 * Màu đọc từ CSS variable để một hình dùng được trên nền sáng lẫn nền tối:
 *   --m-ink   : nét chính (mặc định xanh BK đậm)
 *   --m-accent: màu nhấn của khoa
 *   --m-paper : màu nền (dùng cho chi tiết "khoét")
 *   --m-sun   : vàng nắng
 */
type Props = { motif: MotifId; className?: string; title?: string };

const LABEL: Record<MotifId, string> = {
  generic: 'Lục giác Bách Khoa và mũ cử nhân',
  chemistry: 'Vòng benzen và bình tam giác',
  gantt: 'Biểu đồ Gantt bốn năm hoàn thành',
  circuit: 'Sơ đồ mạch có pin, điện trở và đèn LED',
  building: 'Mặt đứng toà nhà bốn tầng và cần cẩu',
  gears: 'Hai bánh răng ăn khớp',
  leaf: 'Chiếc lá, giọt nước và đường đồng mức',
  wave: 'Đồ thị sóng sin và mô hình nguyên tử',
  strata: 'Mặt cắt địa tầng và giàn khoan',
  lattice: 'Ô mạng tinh thể lập phương tâm khối',
  route: 'Tuyến đường có các ga và máy bay',
  terminal: 'Cửa sổ terminal với lệnh git commit',
};

export function FacultyMotif({ motif, className, title }: Props) {
  return (
    <svg
      className={cx(s.motif, className)}
      viewBox="0 0 346 270"
      role="img"
      aria-label={title ?? LABEL[motif]}
      fill="none"
      stroke="var(--m-ink, #032b91)"
      strokeWidth={2.2}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {MOTIFS[motif]}
    </svg>
  );
}

const mono = { fontFamily: 'var(--font-mono)', fontSize: 12 } as const;
const T = ({ x, y, children, fill = 'var(--m-ink, #032b91)', size = 12, extra }: { x: number; y: number; children: string; fill?: string; size?: number; extra?: React.SVGProps<SVGTextElement> }) => (
  <text x={x} y={y} fill={fill} stroke="none" style={{ ...mono, fontSize: size }} {...extra}>
    {children}
  </text>
);

const MOTIFS: Record<MotifId, React.ReactNode> = {
  generic: (
    <>
      <path d="M173 40 L258 88 L258 182 L173 230 L88 182 L88 88 Z" />
      <path d="M173 70 L232 104 L232 166 L173 200 L114 166 L114 104 Z" strokeOpacity={0.35} />
      <path d="M173 104 L222 124 L173 144 L124 124 Z" fill="var(--m-accent, #032b91)" stroke="none" />
      <path d="M140 134 L140 158 Q173 176 206 158 L206 134" />
      <path d="M173 124 L214 134 L214 166" stroke="var(--m-sun, #f4b740)" />
      <circle cx="214" cy="170" r="5" fill="var(--m-sun, #f4b740)" stroke="none" />
      <T x={96} y={258}>1.461 NGÀY · MỘT TẤM BẰNG</T>
    </>
  ),
  chemistry: (
    <>
      <path d="M100 66 L140 89 L140 135 L100 158 L60 135 L60 89 Z" />
      <circle cx="100" cy="112" r="24" />
      <path d="M140 89 L168 73 M100 158 L100 190 M60 89 L32 73" />
      <path d="M228 60 L228 112 L192 196 Q188 210 202 210 L282 210 Q296 210 292 196 L256 112 L256 60" />
      <path d="M220 60 L264 60" />
      <path d="M207 164 L277 164 L292 196 Q296 210 282 210 L202 210 Q188 210 192 196 Z" fill="var(--m-accent, #0f766e)" stroke="none" />
      <circle cx="232" cy="150" r="5" stroke="var(--m-accent, #0f766e)" strokeWidth={2} />
      <circle cx="248" cy="134" r="3.5" stroke="var(--m-accent, #0f766e)" strokeWidth={2} />
      <T x={40} y={244} size={13}>4 NĂM + CỐ GẮNG  ⟶  CỬ NHÂN</T>
    </>
  ),
  gantt: (
    <>
      <T x={24} y={58} size={11}>NĂM 1</T>
      <T x={24} y={98} size={11}>NĂM 2</T>
      <T x={24} y={138} size={11}>NĂM 3</T>
      <T x={24} y={178} size={11}>NĂM 4</T>
      <path d="M90 30 V200 M150 30 V200 M210 30 V200 M270 30 V200" strokeOpacity={0.18} strokeWidth={1} />
      <rect x="90" y="46" width="70" height="16" fill="var(--m-ink, #032b91)" stroke="none" />
      <rect x="140" y="86" width="74" height="16" fill="var(--m-ink, #032b91)" stroke="none" />
      <rect x="196" y="126" width="70" height="16" fill="var(--m-ink, #032b91)" stroke="none" />
      <rect x="246" y="166" width="56" height="16" fill="var(--m-accent, #b7791f)" stroke="none" />
      <path d="M310 174 L318 166 L326 174 L318 182 Z" fill="var(--m-accent, #b7791f)" stroke="none" />
      <T x={236} y={214} size={11} fill="var(--m-accent, #b7791f)">◆ LỄ TỐT NGHIỆP</T>
      <rect x="24" y="230" width="298" height="10" fill="var(--m-ink, #032b91)" stroke="none" />
      <T x={24} y={258}>TIẾN ĐỘ 100% · ĐÚNG HẠN</T>
    </>
  ),
  circuit: (
    <>
      <path d="M60 70 H150 M190 70 H286 V200 H220 M180 200 H60 V150 M60 110 V70" />
      <path d="M150 70 L156 58 L166 82 L176 58 L184 82 L190 70" />
      <path d="M44 110 H76 M52 122 H68 M44 134 H76 M52 146 H68" />
      <path d="M220 200 L200 186 L200 214 Z" />
      <path d="M180 186 V214" />
      <path d="M196 172 L188 158 M210 170 L212 154 M222 176 L232 164" stroke="var(--m-sun, #f4b740)" strokeWidth={2.4} />
      <circle cx="200" cy="200" r="22" fill="var(--m-sun, #f4b740)" fillOpacity={0.35} stroke="none" />
      <path d="M100 236 Q112 214 124 236 T148 236 T172 236 T196 236 T220 236 T244 236" stroke="var(--m-accent, #0e6fb8)" />
      <T x={40} y={262}>220V · 4 NĂM · ĐÈN ĐÃ SÁNG</T>
    </>
  ),
  building: (
    <>
      <path d="M70 212 V60 H230 V212" />
      <path d="M70 98 H230 M70 136 H230 M70 174 H230" />
      <path d="M110 60 V212 M150 60 V212 M190 60 V212" strokeOpacity={0.35} />
      <path d="M40 212 H306" strokeWidth={3} />
      <path d="M250 212 V40 M240 40 H320 M300 40 V70" />
      <path d="M300 70 L294 82 H306 Z" fill="var(--m-accent, #c2410c)" stroke="var(--m-accent, #c2410c)" />
      <rect x="150" y="60" width="40" height="38" fill="var(--m-accent, #c2410c)" stroke="none" />
      <path d="M40 60 V212 M34 60 H46 M34 212 H46" stroke="var(--m-accent, #c2410c)" strokeWidth={1.4} />
      <T x={8} y={140} size={11} fill="var(--m-accent, #c2410c)" extra={{ transform: 'rotate(-90 22 140)' }}>+4 NĂM</T>
      <T x={250} y={230} size={11} fill="var(--m-accent, #c2410c)">±0.000</T>
      <T x={40} y={254}>ĐỔ BÊ TÔNG TẦNG CUỐI · ĐẠT</T>
    </>
  ),
  gears: (
    <>
      <circle cx="126" cy="126" r="62" strokeWidth={16} strokeDasharray="14 10" />
      <circle cx="126" cy="126" r="52" strokeWidth={3} />
      <circle cx="126" cy="126" r="14" strokeWidth={3} />
      <circle cx="236" cy="168" r="40" stroke="var(--m-accent, #3d5a80)" strokeWidth={14} strokeDasharray="11 8" />
      <circle cx="236" cy="168" r="31" fill="var(--m-accent, #3d5a80)" stroke="none" />
      <circle cx="236" cy="168" r="9" fill="var(--m-paper, #f7f5ef)" stroke="none" />
      <path d="M236 104 L300 70 H330" stroke="var(--m-accent, #3d5a80)" strokeWidth={1.4} />
      <T x={252} y={64} size={11} fill="var(--m-accent, #3d5a80)">Ø2026 ±0</T>
      <T x={40} y={250}>ĂN KHỚP · 1.461 VÒNG</T>
    </>
  ),
  leaf: (
    <>
      <path d="M40 210 C80 170 140 190 180 160 S280 120 310 150" stroke="var(--m-accent, #13784f)" strokeOpacity={0.45} strokeWidth={1.4} />
      <path d="M40 228 C90 190 150 214 196 182 S290 150 316 178" stroke="var(--m-accent, #13784f)" strokeOpacity={0.45} strokeWidth={1.4} />
      <path d="M60 192 C100 156 140 168 172 140 S250 104 296 120" stroke="var(--m-accent, #13784f)" strokeOpacity={0.45} strokeWidth={1.4} />
      <path d="M120 170 C120 100 170 60 230 56 C232 120 196 168 120 170 Z" fill="var(--m-accent, #1f9d68)" stroke="none" />
      <path d="M120 170 C150 136 180 104 220 70" stroke="var(--m-paper, #f7f5ef)" strokeWidth={2.4} />
      <path d="M88 84 C88 84 70 106 70 118 A18 18 0 0 0 106 118 C106 106 88 84 88 84 Z" stroke="var(--m-ink, #0e6fb8)" strokeWidth={2.4} />
      <circle cx="262" cy="74" r="16" stroke="var(--m-sun, #f4b740)" strokeWidth={2.4} />
      <T x={40} y={256} fill="var(--m-accent, #13784f)">CO₂ ↓ · TRI THỨC ↑</T>
    </>
  ),
  wave: (
    <>
      <path d="M30 136 H316 M48 44 V230" strokeWidth={1.6} />
      <path d="M310 130 L316 136 L310 142" strokeWidth={1.6} />
      <path d="M48 136 C70 60 92 60 114 136 S158 212 180 136 S224 60 246 136 S290 212 306 160" stroke="var(--m-accent, #be185d)" strokeWidth={2.6} />
      <ellipse cx="250" cy="68" rx="40" ry="14" strokeWidth={1.8} />
      <ellipse cx="250" cy="68" rx="40" ry="14" strokeWidth={1.8} transform="rotate(60 250 68)" />
      <ellipse cx="250" cy="68" rx="40" ry="14" strokeWidth={1.8} transform="rotate(-60 250 68)" />
      <circle cx="250" cy="68" r="6" fill="var(--m-accent, #be185d)" stroke="none" />
      <T x={40} y={258}>∫ CỐ GẮNG · dt = TẤM BẰNG</T>
    </>
  ),
  strata: (
    <>
      <path d="M0 120 C80 110 160 132 346 116 V146 C200 160 100 140 0 152 Z" fill="#e7d7c1" stroke="none" />
      <path d="M0 152 C100 140 200 160 346 146 V180 C220 192 120 172 0 186 Z" fill="#d2b48c" stroke="none" />
      <path d="M0 186 C120 172 220 192 346 180 V214 C240 222 110 204 0 218 Z" fill="var(--m-accent, #8a5a2b)" stroke="none" />
      <path d="M0 218 C110 204 240 222 346 214 V270 H0 Z" fill="#5c3a1a" stroke="none" />
      <path d="M150 112 L172 30 L194 112 M156 88 H188 M162 64 H182" />
      <path d="M172 112 V206" strokeWidth={3} />
      <circle cx="172" cy="206" r="6" fill="var(--m-sun, #f4b740)" stroke="none" />
      <T x={190} y={210} size={11} fill="#f7f5ef">TẦNG CHỨA: TỐT NGHIỆP</T>
      <T x={20} y={46} size={11} fill="var(--m-accent, #8a5a2b)">ĐỘ SÂU: 1.461 NGÀY</T>
    </>
  ),
  lattice: (
    <>
      <path d="M100 90 H200 V190 H100 Z" strokeWidth={2} />
      <path d="M150 50 H250 V150 H150 Z" strokeWidth={2} />
      <path d="M100 90 L150 50 M200 90 L250 50 M200 190 L250 150 M100 190 L150 150" strokeWidth={2} />
      <path d="M100 90 L250 150 M200 90 L150 150" strokeOpacity={0.25} strokeWidth={2} />
      <g fill="var(--m-accent, #4f46e5)" stroke="none">
        <circle cx="100" cy="90" r="9" /><circle cx="200" cy="90" r="9" /><circle cx="200" cy="190" r="9" /><circle cx="100" cy="190" r="9" />
        <circle cx="150" cy="50" r="9" /><circle cx="250" cy="50" r="9" /><circle cx="250" cy="150" r="9" /><circle cx="150" cy="150" r="9" />
      </g>
      <circle cx="175" cy="120" r="13" fill="var(--m-sun, #f4b740)" stroke="none" />
      <T x={40} y={244}>BCC · NGUYÊN TỬ TRUNG TÂM: BẠN</T>
    </>
  ),
  route: (
    <>
      <path d="M40 200 C90 200 90 150 140 150 S190 100 240 100 S290 60 310 60" stroke="var(--m-accent, #be185d)" strokeWidth={5} />
      <g fill="var(--m-paper, #f7f5ef)" strokeWidth={3}>
        <circle cx="40" cy="200" r="8" /><circle cx="140" cy="150" r="8" /><circle cx="240" cy="100" r="8" />
      </g>
      <circle cx="310" cy="60" r="12" fill="var(--m-ink, #032b91)" stroke="none" />
      <T x={22} y={228} size={11}>NĂM 1</T>
      <T x={122} y={178} size={11}>NĂM 3</T>
      <T x={214} y={128} size={11}>NĂM 4</T>
      <T x={232} y={38} size={11}>GA CUỐI: A5</T>
      <path d="M80 70 L120 82 L150 64 L158 68 L140 88 L166 96 L174 90 L180 94 L170 104 L132 96 L118 112 L110 110 L118 92 L80 80 Z" fill="var(--m-ink, #032b91)" stroke="none" />
      <T x={40} y={258}>ĐÃ CẬP BẾN · ĐÚNG GIỜ</T>
    </>
  ),
  terminal: (
    <>
      <rect x="22" y="30" width="302" height="200" fill="#0a1a3d" stroke="none" />
      <rect x="22" y="30" width="302" height="26" fill="#032b91" stroke="none" />
      <circle cx="38" cy="43" r="5" fill="#f3a6be" stroke="none" /><circle cx="54" cy="43" r="5" fill="#f4b740" stroke="none" /><circle cx="70" cy="43" r="5" fill="#5be0a3" stroke="none" />
      <T x={96} y={47} size={11} fill="rgba(255,255,255,0.7)">~/bach-khoa · main</T>
      <T x={36} y={84} size={12.5} fill="#ffffff">{'$ git commit -m "tốt nghiệp"'}</T>
      <T x={36} y={106} size={12.5} fill="rgba(255,255,255,0.65)">[main 2026] 1461 days changed</T>
      <T x={36} y={134} size={12.5} fill="#ffffff">$ ./deploy --to=gia-dinh</T>
      <T x={36} y={156} size={12.5} fill="rgba(255,255,255,0.65)">Hội trường A5 · xem giờ bên dưới</T>
      <T x={36} y={184} size={12.5} fill="#5be0a3">✓ Build passed</T>
      <T x={36} y={208} size={12.5} fill="#ffffff">$ _</T>
      <T x={22} y={258}>EXIT CODE 0 · KHÔNG CÒN NỢ MÔN</T>
    </>
  ),
};
