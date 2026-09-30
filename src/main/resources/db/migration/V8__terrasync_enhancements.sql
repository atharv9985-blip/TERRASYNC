-- TerraSync Feature Enhancements
alter table compensations add column if not exists market_value double precision default 0;
alter table compensations add column if not exists solatium double precision default 0;
alter table compensations add column if not exists asset_valuation double precision default 0;

alter table hearings add column if not exists virtual_link varchar(500);
alter table hearings add column if not exists presiding_officer varchar(150);

alter table audit_logs add column if not exists hash varchar(64);

alter table users add column if not exists aadhaar_number varchar(20);

create table if not exists utility_assets (
    id bigserial primary key,
    parcel_id bigint not null references parcels(id),
    utility_type varchar(50) not null,
    identifier varchar(100),
    status varchar(100) not null,
    created_at timestamp not null default now()
);
create index if not exists idx_utility_assets_parcel on utility_assets(parcel_id);

create table if not exists system_settings (
    id bigserial primary key,
    setting_key varchar(100) not null unique,
    setting_value varchar(255) not null,
    updated_at timestamp not null default now()
);
