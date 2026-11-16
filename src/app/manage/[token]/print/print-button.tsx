'use client';

import { Button, Icon } from '@/ui';

/** Gọi hộp thoại in của trình duyệt (chọn "Lưu thành PDF" nếu muốn gửi file). */
export function PrintButton({ disabled }: { disabled?: boolean }) {
  return (
    <Button type="button" disabled={disabled} onClick={() => window.print()} leading={<Icon name="print" size={16} />}>
      In / Lưu PDF
    </Button>
  );
}
