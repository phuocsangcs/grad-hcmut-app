'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_DAYS,
  adminSessionValue,
  checkAdminPassword,
  deleteContactMessage,
  isAdminSession,
  markContactRead,
} from '@/modules/legal';
import { limiter, RULES } from '@/modules/moderation';

const PATH = '/admin/inbox';

/** Mọi action đều tự kiểm tra phiên: action là endpoint công khai, không tin vào việc trang đã ẩn nút. */
async function requireAdmin() {
  const jar = await cookies();
  if (!isAdminSession(jar.get(ADMIN_COOKIE)?.value)) redirect(PATH);
}

export async function login(formData: FormData) {
  const h = await headers();
  const ip = h.get('x-real-ip') ?? h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!limiter.hit(`admin:${ip}`, RULES.adminLogin).allowed) redirect(`${PATH}?e=limit`);

  const password = String(formData.get('password') ?? '');
  const session = adminSessionValue();
  if (!session || !checkAdminPassword(password)) redirect(`${PATH}?e=wrong`);

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: ADMIN_SESSION_DAYS * 86_400,
  });
  redirect(PATH);
}

export async function logout() {
  const jar = await cookies();
  jar.delete({ name: ADMIN_COOKIE, path: '/admin' });
  redirect(PATH);
}

export async function toggleRead(formData: FormData) {
  await requireAdmin();
  await markContactRead(String(formData.get('id')), formData.get('read') === '1');
  refresh();
}

export async function removeMessage(formData: FormData) {
  await requireAdmin();
  await deleteContactMessage(String(formData.get('id')));
  refresh();
}
