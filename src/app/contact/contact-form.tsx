'use client';

import { useState } from 'react';
import { api, ApiError } from '@/components/api';
// Import thẳng file validators (chỉ có zod), không qua '@/modules/legal' để code server không lọt vào trình duyệt.
import { CONTACT_MESSAGE_MAX, CONTACT_TOPICS, type ContactTopic } from '@/modules/legal/contact.validators';
import { Button, Field, Input, Select, Textarea } from '@/ui';
import s from './contact.module.css';

const TOPICS = Object.entries(CONTACT_TOPICS) as [ContactTopic, string][];

/**
 * Form liên hệ: tin nhắn lưu vào hệ thống cho chủ dự án đọc, người gửi không cần biết email của ai.
 * Có ô bẫy `website` ẩn: bot điền vào thì server âm thầm bỏ qua.
 */
export function ContactForm({ initialTopic, initialSlug }: { initialTopic?: ContactTopic; initialSlug?: string }) {
  const [topic, setTopic] = useState<ContactTopic>(initialTopic ?? 'feedback');
  const [name, setName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [message, setMessage] = useState('');
  const [cardSlug, setCardSlug] = useState(initialSlug ?? '');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Viết ít nhất 10 ký tự để mình hiểu rõ hơn nhé.');
      return;
    }
    setState('busy');
    setError(null);
    try {
      await api('/api/contact', { method: 'POST', json: { topic, name, replyTo, message, cardSlug: topic === 'content' ? cardSlug : '', website } });
      setState('done');
    } catch (err) {
      setState('idle');
      setError(err instanceof ApiError && err.code === 'rate_limited' ? 'Bạn gửi hơi nhiều rồi, thử lại sau ít phút nhé.' : 'Gửi chưa được, kiểm tra mạng rồi thử lại.');
    }
  }

  if (state === 'done') {
    return (
      <div className={s.done} role="status">
        <b>Đã gửi, cảm ơn bạn!</b>
        <p>{replyTo.trim() ? 'Mình sẽ liên lạc lại qua thông tin bạn để lại.' : 'Bạn không để lại cách liên lạc nên mình sẽ không trả lời được, nhưng chắc chắn sẽ đọc.'}</p>
        <button type="button" className={s.again} onClick={() => { setMessage(''); setState('idle'); }}>Gửi tin khác</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={s.form} noValidate>
      <Field label="Chủ đề">
        <Select value={topic} onChange={(e) => setTopic(e.target.value as ContactTopic)}>
          {TOPICS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </Select>
      </Field>
      {topic === 'content' ? (
        <Field label="Đường dẫn thiệp liên quan" optional hint="Ví dụ: minh-anh-k22">
          <Input value={cardSlug} maxLength={80} autoCapitalize="none" spellCheck={false} onChange={(e) => setCardSlug(e.target.value)} />
        </Field>
      ) : null}
      <Field label="Nội dung" hint={`${message.length}/${CONTACT_MESSAGE_MAX}`}>
        <Textarea required rows={6} maxLength={CONTACT_MESSAGE_MAX} value={message} placeholder="Bạn muốn nhắn gì cho mình?" onChange={(e) => setMessage(e.target.value)} />
      </Field>
      <div className={s.row}>
        <Field label="Tên của bạn" optional>
          <Input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Cách liên lạc lại" optional hint="Email, số Zalo hoặc link Facebook. Bỏ trống nếu không cần trả lời.">
          <Input maxLength={120} value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
        </Field>
      </div>
      {/* Ô bẫy cho bot: ẩn khỏi người dùng và trình đọc màn hình. */}
      <div className={s.trap} aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      {error ? <p role="alert" className={s.error}>{error}</p> : null}
      <div>
        <Button type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Đang gửi…' : 'Gửi tin nhắn'}</Button>
      </div>
    </form>
  );
}
