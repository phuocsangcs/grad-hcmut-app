-- Chạy trong Supabase SQL Editor. Số liệu POC (A3).
select
  (select count(*) from cards)                              as total_cards,
  (select count(*) from cards where locked)                 as locked_cards,
  (select count(*) from cards where expires_at < now())     as expired_cards,
  (select coalesce(sum(view_count), 0) from cards)          as total_views,
  (select count(*) from invites)                            as total_invites,
  (select coalesce(sum(view_count), 0) from invites)        as invite_views,
  (select count(*) from rsvps)                              as total_rsvps,
  (select coalesce(sum(headcount), 0) from rsvps)           as total_guests,
  (select count(*) from rsvps where wish is not null and wish <> '') as total_wishes,
  (select count(*) from reports)                            as total_reports;

-- Theo khoa
select faculty_id, count(*) as cards, coalesce(sum(view_count), 0) as views
from cards group by faculty_id order by cards desc;

-- Theo mẫu
select template_id, count(*) as cards from cards group by template_id order by cards desc;

-- Thiệp tạo theo ngày (giờ VN)
select (created_at at time zone 'Asia/Ho_Chi_Minh')::date as day, count(*)
from cards group by 1 order by 1 desc limit 30;

-- Thiệp bị báo cáo nhiều nhất
select c.slug, c.locked, count(r.id) as reports, count(distinct r.reporter_ip_hash) as distinct_reporters
from reports r join cards c on c.id = r.card_id
group by c.id order by reports desc limit 20;
