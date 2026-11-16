/* =====================================================================
   SOLÉA — Catalogue produits
   ---------------------------------------------------------------------
   1. SOLEA_PRODUCTS : catalogue "de secours". Il est utilisé seulement
      si Supabase n'est pas encore configuré. Les mêmes produits sont
      insérés dans la base par le fichier supabase.sql (mêmes colonnes).
   2. soleaVisual(p) : dessine le flacon SOLÉA en SVG (tube, flacon
      pompe, spray, stick, pot, coffret) avec les couleurs du produit.
      Si un produit a une "image_url", c'est la photo qui est utilisée.
   ===================================================================== */

window.SOLEA_PRODUCTS = [
    {
        id: 1, slug: "voile-lumiere", name: "Voile Lumière SPF 50+", category: "visage", spf: 50,
        price: 29.90, old_price: null, volume: "50 ml", kind: "Fluide visage",
        short_description: "Fluide invisible, fini velours",
        description: "Notre best-seller. Un fluide ultra-léger qui fond instantanément sur la peau sans laisser de trace blanche. Enrichi en niacinamide et vitamine E, il protège des UVA, UVB et de la lumière bleue tout en servant de base de maquillage.",
        tip: "Appliquer le matin en dernière étape de soin, renouveler toutes les 2 h.",
        badge: "Best-seller", rating: 4.9, reviews: 412, stock: 34,
        shape: "bottle", color: "#FFE7C2", accent: "#F39A2B", image_url: null
    },
    {
        id: 2, slug: "creme-eclat-teintee", name: "Crème Éclat Teintée SPF 50+", category: "visage", spf: 50,
        price: 32.90, old_price: null, volume: "40 ml", kind: "Crème teintée",
        short_description: "Teint unifié, effet bonne mine",
        description: "Une crème solaire teintée universelle qui s'adapte à la carnation. Elle floute les imperfections, illumine le teint et offre une très haute protection pour remplacer le fond de teint tout l'été.",
        tip: "Se travaille du bout des doigts, du centre du visage vers l'extérieur.",
        badge: "Nouveau", rating: 4.8, reviews: 186, stock: 21,
        shape: "tube", color: "#E9B38E", accent: "#9C4F2A", image_url: null
    },
    {
        id: 3, slug: "serum-solaire-hydra", name: "Sérum Solaire Hydra SPF 30", category: "visage", spf: 30,
        price: 34.90, old_price: 39.90, volume: "30 ml", kind: "Sérum visage",
        short_description: "Acide hyaluronique, glow quotidien",
        description: "Le geste 2-en-1 pour la ville : un sérum hydratant à l'acide hyaluronique et à l'extrait d'abricot, avec une protection SPF 30 pour les journées urbaines. Fini glowy, jamais gras.",
        tip: "Idéal au quotidien en ville. Pour la plage, préférez le Voile Lumière SPF 50+.",
        badge: "-12 %", rating: 4.7, reviews: 128, stock: 8,
        shape: "bottle", color: "#FFF3DF", accent: "#D9A441", image_url: null
    },
    {
        id: 4, slug: "stick-protecteur", name: "Stick Protecteur SPF 50+", category: "visage", spf: 50,
        price: 14.90, old_price: null, volume: "15 g", kind: "Stick zones sensibles",
        short_description: "Lèvres, nez, oreilles & cicatrices",
        description: "Le compagnon de poche des zones les plus exposées. Sa texture fondante et transparente glisse sur les lèvres, le nez, les pommettes et les cicatrices. Résistant à l'eau et à la transpiration.",
        tip: "Glissez-le dans votre sac de plage, renouvelez après chaque baignade.",
        badge: null, rating: 4.6, reviews: 97, stock: 52,
        shape: "stick", color: "#FFD58A", accent: "#E07A1F", image_url: null
    },
    {
        id: 5, slug: "lait-dore", name: "Lait Doré SPF 30", category: "corps", spf: 30,
        price: 26.90, old_price: null, volume: "200 ml", kind: "Lait corps",
        short_description: "Hydrate 24 h, reflets dorés",
        description: "Un lait fondant aux nacres dorées qui sublime le hâle tout en protégeant. Au beurre de karité et à l'huile d'abricot, il hydrate intensément pendant 24 h et laisse un parfum solaire délicat.",
        tip: "Appliquer généreusement 20 minutes avant l'exposition.",
        badge: "Best-seller", rating: 4.8, reviews: 356, stock: 40,
        shape: "tube", color: "#F7C98B", accent: "#C9622F", image_url: null
    },
    {
        id: 6, slug: "brume-invisible", name: "Brume Invisible SPF 50+", category: "corps", spf: 50,
        price: 28.90, old_price: null, volume: "150 ml", kind: "Brume corps",
        short_description: "Spray transparent, résistant à l'eau",
        description: "Une brume 100 % transparente qui s'applique en quelques secondes, même sur peau mouillée. Très haute protection, très résistante à l'eau, elle ne colle pas au sable.",
        tip: "Vaporiser à 15 cm puis étaler pour une couche homogène.",
        badge: null, rating: 4.9, reviews: 289, stock: 27,
        shape: "spray", color: "#FBE2CE", accent: "#E0672A", image_url: null
    },
    {
        id: 7, slug: "huile-sublime", name: "Huile Sublime SPF 30", category: "corps", spf: 30,
        price: 31.90, old_price: null, volume: "150 ml", kind: "Huile sèche",
        short_description: "Huile sèche satinée au monoï",
        description: "Une huile sèche protectrice au monoï de Tahiti qui pénètre instantanément. Elle laisse la peau satinée, jamais grasse, et révèle un hâle lumineux. Édition limitée été 2026.",
        tip: "S'utilise aussi sur les pointes des cheveux pour les protéger du soleil.",
        badge: "Édition limitée", rating: 4.7, reviews: 143, stock: 6,
        shape: "spray", color: "#F2A65A", accent: "#8F3F1B", image_url: null
    },
    {
        id: 8, slug: "lait-kids", name: "Lait Kids SPF 50+", category: "corps", spf: 50,
        price: 24.90, old_price: null, volume: "200 ml", kind: "Enfants",
        short_description: "Très haute protection, sans parfum",
        description: "Formulé pour les peaux fragiles des enfants dès 3 ans. Sans parfum, hypoallergénique et très résistant à l'eau, ce lait s'étale facilement pour des applications rapides entre deux châteaux de sable.",
        tip: "Éviter l'exposition entre 12 h et 16 h, même protégé.",
        badge: null, rating: 4.9, reviews: 211, stock: 30,
        shape: "tube", color: "#FFE08A", accent: "#5E9EA6", image_url: null
    },
    {
        id: 9, slug: "gelee-fraiche", name: "Gelée Fraîche Après-Soleil", category: "apres-soleil", spf: null,
        price: 19.90, old_price: null, volume: "200 ml", kind: "Gelée après-soleil",
        short_description: "Aloe vera & monoï, effet froid",
        description: "Une gelée fondante à 40 % d'aloe vera bio qui procure une sensation de fraîcheur immédiate. Elle apaise les rougeurs, réhydrate en profondeur et aide à prolonger le bronzage.",
        tip: "Conserver au réfrigérateur pour un effet glaçon encore plus intense.",
        badge: "Best-seller", rating: 4.8, reviews: 264, stock: 45,
        shape: "tube", color: "#DCEFE8", accent: "#5E9EA6", image_url: null
    },
    {
        id: 10, slug: "baume-reparateur-nuit", name: "Baume Réparateur Nuit", category: "apres-soleil", spf: null,
        price: 27.90, old_price: null, volume: "50 ml", kind: "Baume nuit",
        short_description: "Répare la peau pendant la nuit",
        description: "Un baume riche au panthénol et à l'huile de calendula qui répare la barrière cutanée pendant le sommeil. Au réveil, la peau est souple, apaisée et le hâle uniforme.",
        tip: "Masser en fine couche le soir sur le visage et le décolleté.",
        badge: null, rating: 4.7, reviews: 88, stock: 18,
        shape: "jar", color: "#F4E1D2", accent: "#C9622F", image_url: null
    },
    {
        id: 11, slug: "brume-apaisante", name: "Brume Apaisante Aloé", category: "apres-soleil", spf: null,
        price: 16.90, old_price: null, volume: "100 ml", kind: "Brume apaisante",
        short_description: "Rafraîchit et apaise instantanément",
        description: "Une eau florale de fleur d'oranger et d'aloe vera à vaporiser à tout moment de la journée pour rafraîchir la peau échauffée par le soleil. Format voyage.",
        tip: "Parfaite après la plage, dans la voiture ou au bureau.",
        badge: null, rating: 4.6, reviews: 74, stock: 33,
        shape: "spray", color: "#E6F2EE", accent: "#7FB7AE", image_url: null
    },
    {
        id: 12, slug: "coffret-rituel-ete", name: "Coffret Rituel Été", category: "coffret", spf: 50,
        price: 69.90, old_price: 84.60, volume: "3 soins", kind: "Coffret cadeau",
        short_description: "Voile Lumière + Lait Doré + Gelée Fraîche",
        description: "La routine solaire complète dans un coffret à offrir (ou à s'offrir) : le Voile Lumière SPF 50+ pour le visage, le Lait Doré SPF 30 pour le corps et la Gelée Fraîche après-soleil. Livré avec une trousse en coton bio.",
        tip: "Livré prêt à offrir avec une carte personnalisable.",
        badge: "-17 %", rating: 5.0, reviews: 61, stock: 12,
        shape: "box", color: "#3A2416", accent: "#FBB954", image_url: null
    }
];

/* ---------- Dessin SVG des produits ---------- */
(function () {
    let uid = 0;

    // Couleur claire ou foncée ? (pour choisir la couleur du texte)
    function isDark(hex) {
        const h = hex.replace("#", "");
        const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
    }

    // Éclaircit (amount > 0) ou assombrit (amount < 0) une couleur hexadécimale
    function shade(hex, amount) {
        const h = hex.replace("#", "");
        const ch = [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16));
        const out = ch.map((v) => Math.round(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount)));
        return "#" + out.map((v) => v.toString(16).padStart(2, "0")).join("");
    }

    function spfLabel(p) {
        if (!p.spf) return "APRÈS-SOLEIL";
        return "SPF " + p.spf + (p.spf >= 50 ? "+" : "");
    }

    function txt(x, y, s, size, fill, opts) {
        opts = opts || {};
        const font = opts.serif === false ? "DM Sans, sans-serif" : "Fraunces, Georgia, serif";
        const weight = opts.weight || 500;
        const ls = opts.ls || 0;
        const rot = opts.rotate ? ` transform="rotate(${opts.rotate} ${x} ${y})"` : "";
        return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${font}" font-size="${size}" font-weight="${weight}" letter-spacing="${ls}" fill="${fill}"${rot}>${s}</text>`;
    }

    function label(cx, y, p, ink, compact) {
        const kind = (p.kind || "").toUpperCase();
        return txt(cx, y, "SOLÉA", compact ? 18 : 22, ink, { ls: 5, weight: 600 }) +
            `<line x1="${cx - 18}" x2="${cx + 18}" y1="${y + 12}" y2="${y + 12}" stroke="${ink}" stroke-opacity=".35"/>` +
            txt(cx, y + 30, kind, compact ? 7.5 : 8.5, ink, { serif: false, ls: 1.6, weight: 600 });
    }

    window.soleaVisual = function (p) {
        if (p.image_url) {
            return `<img src="${p.image_url}" alt="${p.name}" loading="lazy">`;
        }
        const id = "sv" + (++uid);
        const c = p.color || "#FFE7C2";
        const a = p.accent || "#F39A2B";
        const ink = isDark(c) ? "#FFF6E8" : "#2A1A10";
        const spf = spfLabel(p);
        const spfSize = p.spf ? 30 : 15;
        let shape = "";

        switch (p.shape) {
            case "bottle":
                shape = `
                <rect x="186" y="150" width="28" height="22" fill="${a}"/>
                <rect x="160" y="124" width="80" height="26" rx="9" fill="url(#${id}a)"/>
                <rect x="232" y="131" width="46" height="11" rx="5.5" fill="${a}"/>
                <rect x="170" y="166" width="60" height="30" rx="7" fill="url(#${id}a)"/>
                <rect x="138" y="190" width="124" height="240" rx="28" fill="url(#${id}b)"/>
                <rect x="150" y="204" width="14" height="210" rx="7" fill="#fff" opacity=".28"/>
                ${label(200, 258, p, ink)}
                ${txt(200, 372, spf, spfSize, ink, { weight: 500 })}`;
                break;
            case "tube":
                shape = `
                <rect x="132" y="86" width="136" height="20" rx="4" fill="url(#${id}b)"/>
                <g stroke="${ink}" stroke-opacity=".15">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => `<line x1="${140 + i * 10}" x2="${140 + i * 10}" y1="89" y2="103"/>`).join("")}</g>
                <path d="M134 106 H266 L242 366 Q240 374 232 374 H168 Q160 374 158 366 Z" fill="url(#${id}b)"/>
                <path d="M150 112 L164 112 L176 360 L168 360 Z" fill="#fff" opacity=".28"/>
                <rect x="163" y="372" width="74" height="58" rx="12" fill="url(#${id}a)"/>
                ${label(200, 168, p, ink)}
                ${txt(200, 300, spf, spfSize, ink, { weight: 500 })}`;
                break;
            case "spray":
                shape = `
                <rect x="150" y="96" width="100" height="84" rx="26" fill="url(#${id}a)"/>
                <rect x="164" y="106" width="10" height="62" rx="5" fill="#fff" opacity=".3"/>
                <rect x="140" y="172" width="120" height="258" rx="42" fill="url(#${id}b)"/>
                <rect x="153" y="196" width="14" height="210" rx="7" fill="#fff" opacity=".28"/>
                ${label(200, 250, p, ink)}
                ${txt(200, 364, spf, spfSize, ink, { weight: 500 })}`;
                break;
            case "stick":
                shape = `
                <rect x="166" y="168" width="68" height="262" rx="30" fill="url(#${id}b)"/>
                <rect x="166" y="108" width="68" height="96" rx="30" fill="url(#${id}a)"/>
                <rect x="166" y="190" width="68" height="14" fill="url(#${id}a)"/>
                <rect x="176" y="214" width="9" height="200" rx="4.5" fill="#fff" opacity=".3"/>
                ${txt(206, 318, "SOLÉA", 20, ink, { ls: 5, weight: 600, rotate: -90 })}
                ${txt(226, 318, spf, 11, ink, { serif: false, ls: 2, weight: 700, rotate: -90 })}`;
                break;
            case "jar":
                shape = `
                <rect x="104" y="246" width="192" height="56" rx="16" fill="url(#${id}a)"/>
                <rect x="104" y="270" width="192" height="6" fill="#000" opacity=".06"/>
                <rect x="112" y="296" width="176" height="134" rx="24" fill="url(#${id}b)"/>
                <rect x="126" y="308" width="12" height="108" rx="6" fill="#fff" opacity=".28"/>
                ${label(200, 348, p, ink, true)}
                ${txt(200, 410, spf, 12, ink, { serif: false, ls: 2, weight: 700 })}`;
                break;
            case "box":
                shape = `
                <rect x="138" y="118" width="54" height="120" rx="14" fill="#FFE7C2"/>
                <rect x="150" y="98" width="30" height="24" rx="6" fill="#F39A2B"/>
                <path d="M206 92 H262 L250 230 H218 Z" fill="#F7C98B"/>
                <rect x="94" y="196" width="212" height="234" rx="14" fill="url(#${id}b)"/>
                <circle cx="200" cy="300" r="46" fill="url(#${id}a)"/>
                <g stroke="${a}" stroke-width="3" stroke-linecap="round" opacity=".7">
                    ${[0, 45, 90, 135, 180, 225, 270, 315].map(d => { const r = d * Math.PI / 180; return `<line x1="${200 + Math.cos(r) * 56}" y1="${300 + Math.sin(r) * 56}" x2="${200 + Math.cos(r) * 68}" y2="${300 + Math.sin(r) * 68}"/>`; }).join("")}
                </g>
                ${txt(200, 400, "SOLÉA", 22, ink, { ls: 6, weight: 600 })}
                ${txt(200, 418, "RITUEL ÉTÉ", 8.5, ink, { serif: false, ls: 2, weight: 600 })}
                ${txt(200, 230, "COFFRET", 9, ink, { serif: false, ls: 3, weight: 600 })}`;
                break;
        }

        return `
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="${id}bg" cx="50%" cy="38%" r="75%">
                    <stop offset="0" stop-color="#FFF8EC"/>
                    <stop offset="1" stop-color="#F6E7D2"/>
                </radialGradient>
                <radialGradient id="${id}sun" cx="50%" cy="50%" r="50%">
                    <stop offset="0" stop-color="${p.category === "apres-soleil" ? "#BFE0D8" : "#FFC56B"}" stop-opacity=".95"/>
                    <stop offset="1" stop-color="${p.category === "apres-soleil" ? "#BFE0D8" : "#F39A2B"}" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="${id}b" x1="0" x2="1">
                    <stop offset="0" stop-color="${c}"/>
                    <stop offset=".55" stop-color="${c}"/>
                    <stop offset="1" stop-color="${shade(c, isDark(c) ? 0.18 : -0.16)}"/>
                </linearGradient>
                <linearGradient id="${id}a" x1="0" x2="1">
                    <stop offset="0" stop-color="${a}"/>
                    <stop offset="1" stop-color="${shade(a, -0.14)}"/>
                </linearGradient>
            </defs>
            <rect width="400" height="500" fill="url(#${id}bg)"/>
            <circle cx="200" cy="215" r="190" fill="url(#${id}sun)"/>
            <ellipse cx="200" cy="436" rx="104" ry="11" fill="#7A4A22" opacity=".16"/>
            ${shape}
        </svg>`;
    };

    // Petit helper réutilisé ailleurs
    window.soleaSpfLabel = spfLabel;
})();
