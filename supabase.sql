-- =====================================================================
-- SOLÉA — Base de données Supabase (PostgreSQL)
-- ---------------------------------------------------------------------
-- À coller dans Supabase > SQL Editor > New query > RUN
-- Crée 3 tables :
--   products   : le catalogue (lu par le site)
--   orders     : les commandes passées sur le site
--   newsletter : les inscrits au Club Soleil
-- + les règles de sécurité (RLS) + les 12 produits SOLÉA.
-- (Même principe que la table "products" SQLite vue en cours,
--  mais hébergée en ligne par Supabase.)
-- =====================================================================

-- ---------- 1. TABLE PRODUITS ----------
drop table if exists public.products cascade;
create table public.products (
    id                bigint generated always as identity primary key,
    slug              text unique not null,
    name              text not null,
    category          text not null check (category in ('visage','corps','apres-soleil','coffret')),
    kind              text,
    spf               int,
    price             numeric(10,2) not null check (price >= 0),
    old_price         numeric(10,2),
    volume            text,
    short_description text,
    description       text,
    tip               text,
    badge             text,
    rating            numeric(2,1) default 5,
    reviews           int default 0,
    stock             int default 0,
    shape             text default 'tube',   -- tube | bottle | spray | stick | jar | box
    color             text default '#FFE7C2', -- couleur du flacon
    accent            text default '#F39A2B', -- couleur du bouchon
    image_url         text,                   -- optionnel : URL d'une vraie photo
    created_at        timestamptz default now()
);

-- ---------- 2. TABLE COMMANDES ----------
drop table if exists public.orders cascade;
create table public.orders (
    id            bigint generated always as identity primary key,
    order_ref     text unique not null,
    customer_name text not null,
    email         text not null,
    address       text not null,
    zip           text not null,
    city          text not null,
    promo_code    text,
    items         jsonb not null,           -- [{product_id, name, qty, unit_price}]
    subtotal      numeric(10,2) not null,
    discount      numeric(10,2) default 0,
    shipping      numeric(10,2) default 0,
    total         numeric(10,2) not null,
    status        text default 'nouvelle',
    created_at    timestamptz default now()
);

-- ---------- 3. TABLE NEWSLETTER ----------
drop table if exists public.newsletter cascade;
create table public.newsletter (
    id         bigint generated always as identity primary key,
    email      text unique not null,
    created_at timestamptz default now()
);

-- ---------- 4. SÉCURITÉ (Row Level Security) ----------
-- Le site utilise la clé publique "anon" : on autorise seulement
--   - LIRE les produits
--   - AJOUTER une commande
--   - AJOUTER un e-mail à la newsletter
-- Personne ne peut lire les commandes / e-mails depuis le site.
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.newsletter enable row level security;

-- Droits d'accès de l'API (nécessaires si "expose new tables" est désactivé)
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant insert on public.newsletter to anon, authenticated;

create policy "Lecture publique des produits"
    on public.products for select to anon, authenticated using (true);

create policy "Créer une commande"
    on public.orders for insert to anon, authenticated with check (true);

create policy "S'inscrire à la newsletter"
    on public.newsletter for insert to anon, authenticated with check (true);

-- ---------- 5. LES 12 PRODUITS SOLÉA ----------
insert into public.products
    (slug, name, category, kind, spf, price, old_price, volume, short_description, description, tip, badge, rating, reviews, stock, shape, color, accent)
values
('voile-lumiere', 'Voile Lumière SPF 50+', 'visage', 'Fluide visage', 50, 29.90, null, '50 ml',
 'Fluide invisible, fini velours',
 'Notre best-seller. Un fluide ultra-léger qui fond instantanément sur la peau sans laisser de trace blanche. Enrichi en niacinamide et vitamine E, il protège des UVA, UVB et de la lumière bleue tout en servant de base de maquillage.',
 'Appliquer le matin en dernière étape de soin, renouveler toutes les 2 h.',
 'Best-seller', 4.9, 412, 34, 'bottle', '#FFE7C2', '#F39A2B'),

('creme-eclat-teintee', 'Crème Éclat Teintée SPF 50+', 'visage', 'Crème teintée', 50, 32.90, null, '40 ml',
 'Teint unifié, effet bonne mine',
 'Une crème solaire teintée universelle qui s''adapte à la carnation. Elle floute les imperfections, illumine le teint et offre une très haute protection pour remplacer le fond de teint tout l''été.',
 'Se travaille du bout des doigts, du centre du visage vers l''extérieur.',
 'Nouveau', 4.8, 186, 21, 'tube', '#E9B38E', '#9C4F2A'),

('serum-solaire-hydra', 'Sérum Solaire Hydra SPF 30', 'visage', 'Sérum visage', 30, 34.90, 39.90, '30 ml',
 'Acide hyaluronique, glow quotidien',
 'Le geste 2-en-1 pour la ville : un sérum hydratant à l''acide hyaluronique et à l''extrait d''abricot, avec une protection SPF 30 pour les journées urbaines. Fini glowy, jamais gras.',
 'Idéal au quotidien en ville. Pour la plage, préférez le Voile Lumière SPF 50+.',
 '-12 %', 4.7, 128, 8, 'bottle', '#FFF3DF', '#D9A441'),

('stick-protecteur', 'Stick Protecteur SPF 50+', 'visage', 'Stick zones sensibles', 50, 14.90, null, '15 g',
 'Lèvres, nez, oreilles & cicatrices',
 'Le compagnon de poche des zones les plus exposées. Sa texture fondante et transparente glisse sur les lèvres, le nez, les pommettes et les cicatrices. Résistant à l''eau et à la transpiration.',
 'Glissez-le dans votre sac de plage, renouvelez après chaque baignade.',
 null, 4.6, 97, 52, 'stick', '#FFD58A', '#E07A1F'),

('lait-dore', 'Lait Doré SPF 30', 'corps', 'Lait corps', 30, 26.90, null, '200 ml',
 'Hydrate 24 h, reflets dorés',
 'Un lait fondant aux nacres dorées qui sublime le hâle tout en protégeant. Au beurre de karité et à l''huile d''abricot, il hydrate intensément pendant 24 h et laisse un parfum solaire délicat.',
 'Appliquer généreusement 20 minutes avant l''exposition.',
 'Best-seller', 4.8, 356, 40, 'tube', '#F7C98B', '#C9622F'),

('brume-invisible', 'Brume Invisible SPF 50+', 'corps', 'Brume corps', 50, 28.90, null, '150 ml',
 'Spray transparent, résistant à l''eau',
 'Une brume 100 % transparente qui s''applique en quelques secondes, même sur peau mouillée. Très haute protection, très résistante à l''eau, elle ne colle pas au sable.',
 'Vaporiser à 15 cm puis étaler pour une couche homogène.',
 null, 4.9, 289, 27, 'spray', '#FBE2CE', '#E0672A'),

('huile-sublime', 'Huile Sublime SPF 30', 'corps', 'Huile sèche', 30, 31.90, null, '150 ml',
 'Huile sèche satinée au monoï',
 'Une huile sèche protectrice au monoï de Tahiti qui pénètre instantanément. Elle laisse la peau satinée, jamais grasse, et révèle un hâle lumineux. Édition limitée été 2026.',
 'S''utilise aussi sur les pointes des cheveux pour les protéger du soleil.',
 'Édition limitée', 4.7, 143, 6, 'spray', '#F2A65A', '#8F3F1B'),

('lait-kids', 'Lait Kids SPF 50+', 'corps', 'Enfants', 50, 24.90, null, '200 ml',
 'Très haute protection, sans parfum',
 'Formulé pour les peaux fragiles des enfants dès 3 ans. Sans parfum, hypoallergénique et très résistant à l''eau, ce lait s''étale facilement pour des applications rapides entre deux châteaux de sable.',
 'Éviter l''exposition entre 12 h et 16 h, même protégé.',
 null, 4.9, 211, 30, 'tube', '#FFE08A', '#5E9EA6'),

('gelee-fraiche', 'Gelée Fraîche Après-Soleil', 'apres-soleil', 'Gelée après-soleil', null, 19.90, null, '200 ml',
 'Aloe vera & monoï, effet froid',
 'Une gelée fondante à 40 % d''aloe vera bio qui procure une sensation de fraîcheur immédiate. Elle apaise les rougeurs, réhydrate en profondeur et aide à prolonger le bronzage.',
 'Conserver au réfrigérateur pour un effet glaçon encore plus intense.',
 'Best-seller', 4.8, 264, 45, 'tube', '#DCEFE8', '#5E9EA6'),

('baume-reparateur-nuit', 'Baume Réparateur Nuit', 'apres-soleil', 'Baume nuit', null, 27.90, null, '50 ml',
 'Répare la peau pendant la nuit',
 'Un baume riche au panthénol et à l''huile de calendula qui répare la barrière cutanée pendant le sommeil. Au réveil, la peau est souple, apaisée et le hâle uniforme.',
 'Masser en fine couche le soir sur le visage et le décolleté.',
 null, 4.7, 88, 18, 'jar', '#F4E1D2', '#C9622F'),

('brume-apaisante', 'Brume Apaisante Aloé', 'apres-soleil', 'Brume apaisante', null, 16.90, null, '100 ml',
 'Rafraîchit et apaise instantanément',
 'Une eau florale de fleur d''oranger et d''aloe vera à vaporiser à tout moment de la journée pour rafraîchir la peau échauffée par le soleil. Format voyage.',
 'Parfaite après la plage, dans la voiture ou au bureau.',
 null, 4.6, 74, 33, 'spray', '#E6F2EE', '#7FB7AE'),

('coffret-rituel-ete', 'Coffret Rituel Été', 'coffret', 'Coffret cadeau', 50, 69.90, 84.60, '3 soins',
 'Voile Lumière + Lait Doré + Gelée Fraîche',
 'La routine solaire complète dans un coffret à offrir (ou à s''offrir) : le Voile Lumière SPF 50+ pour le visage, le Lait Doré SPF 30 pour le corps et la Gelée Fraîche après-soleil. Livré avec une trousse en coton bio.',
 'Livré prêt à offrir avec une carte personnalisable.',
 '-17 %', 5.0, 61, 12, 'box', '#3A2416', '#FBB954');

-- Vérification : doit afficher 12 lignes
select id, name, price, stock from public.products order by id;
