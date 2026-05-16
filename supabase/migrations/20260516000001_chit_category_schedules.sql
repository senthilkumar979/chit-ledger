-- Normalize chit.category to collection schedules used by the app.
update public.chits
set category = '20th of every month'
where category in ('Premium', 'Family');

update public.chits
set category = '5th of every month'
where category in ('Standard', 'Corporate');

update public.chits
set category = '5th of every month'
where category not in ('5th of every month', '20th of every month');
