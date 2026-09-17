alter table orders add column if not exists whatsapp_norm text;

update orders
set whatsapp_norm = case
  when regexp_replace(whatsapp, '\D', '', 'g') like '0%'
    then '62' || substr(regexp_replace(whatsapp, '\D', '', 'g'), 2)
  when regexp_replace(whatsapp, '\D', '', 'g') like '62%'
    then regexp_replace(whatsapp, '\D', '', 'g')
  else '62' || regexp_replace(whatsapp, '\D', '', 'g')
end
where whatsapp_norm is null and whatsapp is not null;

create unique index if not exists orders_email_lower_uidx on orders (lower(email));
create unique index if not exists orders_whatsapp_norm_uidx on orders (whatsapp_norm);
