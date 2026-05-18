"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const REGIONS_BF = [
    {
        region: 'Centre-Nord',
        provinces: [
            { province: 'Bam', communes: ['Kongoussi', 'Rouko', 'Sabcé', 'Tikaré', 'Zimtanga'] },
            { province: 'Namentenga', communes: ['Boulsa', 'Bouroum', 'Tougouri', 'Yalgo'] },
            { province: 'Sanmatenga', communes: ['Kaya', 'Barsalogho', 'Pissila', 'Pensa'] },
        ],
        lat: 13.5, lng: -1.2,
    },
    {
        region: 'Sahel',
        provinces: [
            { province: 'Séno', communes: ['Dori', 'Bani', 'Gorgadji', 'Sampelga'] },
            { province: 'Oudalan', communes: ['Gorom-Gorom', 'Déou', 'Markoye', 'Tin-Akoff'] },
            { province: 'Soum', communes: ['Djibo', 'Kelbo', 'Nassoumbou', 'Tongomayel'] },
        ],
        lat: 14.0, lng: -0.1,
    },
    {
        region: 'Nord',
        provinces: [
            { province: 'Loroum', communes: ['Titao', 'Banh', 'Kain', 'Sollé'] },
            { province: 'Yatenga', communes: ['Ouahigouya', 'Gomponsomtenga', 'Séguénéga', 'Thiou'] },
            { province: 'Zondoma', communes: ['Gourcy', 'Bassi', 'Lèba'] },
        ],
        lat: 13.6, lng: -2.5,
    },
];
const VILLAGES = [
    'Koudtenga', 'Barkoundouba', 'Sikiré', 'Tambogo', 'Nonghin',
    'Zoaga', 'Wendou', 'Toécé', 'Mogtédo', 'Salogo',
    'Tangassogo', 'Nébou', 'Boussouma', 'Pouytenga', 'Korsimoro',
    'Bomboré', 'Dablo', 'Foubé', 'Zéguédéguin', 'Oula',
];
const PRÉNOMS_M = ['Hamidou', 'Boureima', 'Abdoulaye', 'Moussa', 'Ibrahim', 'Oumarou', 'Souleymane', 'Alassane', 'Mamadou', 'Adama', 'Seydou', 'Drissa', 'Rasmané', 'Zakaria', 'Issouf'];
const PRÉNOMS_F = ['Aminata', 'Fatimata', 'Mariam', 'Aïssata', 'Hawa', 'Balkissa', 'Safiatou', 'Ramatou', 'Djeneba', 'Fatoumata', 'Salamata', 'Zénabo', 'Bibata', 'Rokiatou', 'Assétou'];
const NOMS = ['Ouédraogo', 'Sawadogo', 'Traoré', 'Diallo', 'Kaboré', 'Koné', 'Coulibaly', 'Compaoré', 'Zongo', 'Barry', 'Barro', 'Sore', 'Tiendrébeogo', 'Nana', 'Sankara'];
const SPECIES_DATA = [
    { scientificName: 'Faidherbia albida', localNameFr: 'Gonakier', localNameMoore: 'Zaanré', localNameDioula: 'Banan', category: 'arbre', isNative: true, ecologicalRole: 'Fixateur d\'azote, ombrage inversé' },
    { scientificName: 'Acacia senegal', localNameFr: 'Gommier du Sénégal', localNameMoore: 'Ifan', localNameDioula: 'Gommier', category: 'arbre', isNative: true, ecologicalRole: 'Production de gomme arabique, fixateur d\'azote' },
    { scientificName: 'Acacia seyal', localNameFr: 'Épineux du Sahel', localNameMoore: 'Seguega', localNameDioula: 'Séguéguéni', category: 'arbre', isNative: true, ecologicalRole: 'Brise-vent, fourrage, bois de chauffe' },
    { scientificName: 'Ziziphus mauritiana', localNameFr: 'Jujubier', localNameMoore: 'Yiiga', localNameDioula: 'Ntomoni', category: 'arbre', isNative: true, ecologicalRole: 'Fruits comestibles, fourrage, ombrage' },
    { scientificName: 'Balanites aegyptiaca', localNameFr: 'Dattier du désert', localNameMoore: 'Tiika', localNameDioula: 'Sébé', category: 'arbre', isNative: true, ecologicalRole: 'Fruits, huile, médecine traditionnelle' },
    { scientificName: 'Piliostigma reticulatum', localNameFr: 'Caroubier du Sahel', localNameMoore: 'Tamsenga', localNameDioula: 'N\'golonin', category: 'arbre', isNative: true, ecologicalRole: 'Bois, fourrage, fixation azote' },
    { scientificName: 'Guiera senegalensis', localNameFr: 'Guiera', localNameMoore: 'Wilga', localNameDioula: 'Kolonsoni', category: 'arbuste', isNative: true, ecologicalRole: 'Protection sol, fourrage, médecine' },
    { scientificName: 'Combretum micranthum', localNameFr: 'Kinkeliba', localNameMoore: 'Siiga', localNameDioula: 'Kinkéliba', category: 'arbuste', isNative: true, ecologicalRole: 'Tisane médicinale, bois de service' },
    { scientificName: 'Boscia senegalensis', localNameFr: 'Boscia', localNameMoore: 'Aga', localNameDioula: 'Sèkè', category: 'arbuste', isNative: true, ecologicalRole: 'Fruits comestibles période de soudure, fourrage' },
    { scientificName: 'Lannea microcarpa', localNameFr: 'Raisinier', localNameMoore: 'Koabga', localNameDioula: 'Raisinie', category: 'arbre', isNative: true, ecologicalRole: 'Fruits, gommier, ombrage' },
    { scientificName: 'Vitellaria paradoxa', localNameFr: 'Karité', localNameMoore: 'Taanga', localNameDioula: 'Sî', category: 'arbre', isNative: true, ecologicalRole: 'Beurre de karité, ombrage, bois' },
    { scientificName: 'Parkia biglobosa', localNameFr: 'Néré', localNameMoore: 'Rôro', localNameDioula: 'Nérédou', category: 'arbre', isNative: true, ecologicalRole: 'Soumbala (condiment), fruits, ombrage' },
];
const FORMATIONS_DATA = [
    {
        titleFr: 'Introduction à la RNA',
        titleMoore: 'Sondré RNA yɩl-yɩlgo',
        contentFr: 'La Régénération Naturelle Assistée (RNA) est une technique agroforestière simple et peu coûteuse qui consiste à protéger et gérer les pousses naturelles d\'arbres et arbustes qui émergent spontanément dans les champs. Au lieu de les arracher lors des sarclages, on les sélectionne, on les taille et on les protège pour qu\'ils grandissent et apportent de multiples bénéfices : ombrage, fertilité du sol, bois, fruits, fourrage.',
        category: 'technique_rna',
        orderIndex: 1,
    },
    {
        titleFr: 'Identification des espèces prioritaires RNA',
        titleMoore: 'Toenga weoogo RNA yɩ-yɩl-yɩlgo',
        contentFr: 'Dans les zones sahéliennes, certaines espèces sont particulièrement valorisées en RNA pour leurs multiples usages. Le Faidherbia albida (Gonakier) est la reine de la RNA : il perd ses feuilles en saison des pluies (ombrage inversé) et les garde en saison sèche, fournissant fourrage et engrais azoté. Le Guiera senegalensis (Wilga) est l\'espèce la plus commune des champs et très facile à gérer en RNA. Le Ziziphus mauritiana (Jujubier) produit des fruits nutritifs très appréciés.',
        category: 'botanique',
        orderIndex: 2,
    },
    {
        titleFr: 'Techniques de taille et de sélection',
        titleMoore: 'Tɩɩsgo ne yɩɩbgo toenga',
        contentFr: 'La sélection consiste à choisir les meilleures pousses sur chaque souche. On garde 1 à 5 tiges principales selon l\'espèce. La taille de formation se fait en début de saison sèche : on coupe les branches latérales basses pour favoriser la croissance verticale. On laisse les branches à partir de 1.5 à 2 mètres de hauteur pour ne pas gêner les cultures. L\'objectif est d\'obtenir un arbre bien formé qui n\'ombre pas trop les cultures.',
        category: 'technique_rna',
        orderIndex: 3,
    },
    {
        titleFr: 'Suivi et inventaire des parcelles RNA',
        contentFr: 'Un bon suivi RNA nécessite un inventaire régulier (annuel minimum). Pour chaque parcelle, on compte le nombre total de pieds d\'arbres et arbustes par espèce, on note le nombre de pieds sélectionnés (RNA), on évalue l\'état sanitaire (bon, moyen, mauvais), et on mesure la hauteur approximative. Ces données permettent de suivre l\'évolution de la densité ligneuse et l\'impact de la RNA sur la productivité agricole.',
        category: 'technique_rna',
        orderIndex: 4,
    },
    {
        titleFr: 'Valorisation économique des produits RNA',
        contentFr: 'La RNA génère plusieurs types de revenus et d\'économies. Les produits forestiers non ligneux (PFNL) incluent les fruits (jujubes, balanites, néré, karité), les feuilles (fourrage, alimentation), les gousses (Faidherbia), les fleurs (miel), les écorces et les gommes. Les produits ligneux comprennent le bois de chauffe (élagages) et le bois de service. L\'enregistrement régulier de ces productions permet d\'évaluer la valeur économique de la RNA et de sensibiliser les producteurs.',
        category: 'economique',
        orderIndex: 5,
    },
];
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function generateGPSNearPoint(baseLat, baseLng, radiusKm = 0.5) {
    const r = radiusKm / 111;
    return {
        latitude: baseLat + (Math.random() - 0.5) * 2 * r,
        longitude: baseLng + (Math.random() - 0.5) * 2 * r,
    };
}
function generateParcelGPS(centerLat, centerLng, areaHa) {
    const halfSide = Math.sqrt(areaHa) * 0.0045;
    return [
        { lat: centerLat - halfSide, lng: centerLng - halfSide },
        { lat: centerLat + halfSide, lng: centerLng - halfSide },
        { lat: centerLat + halfSide, lng: centerLng + halfSide },
        { lat: centerLat - halfSide, lng: centerLng + halfSide },
        { lat: centerLat - halfSide, lng: centerLng - halfSide },
    ];
}
async function main() {
    console.log('🌱 Démarrage du seeding RNA Guide...\n');
    await prisma.syncLog.deleteMany();
    await prisma.exploitation.deleteMany();
    await prisma.inventorySpecies.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.photoPoint.deleteMany();
    await prisma.parcel.deleteMany();
    await prisma.formation.deleteMany();
    await prisma.species.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    console.log('🧹 Base de données nettoyée');
    console.log('🌳 Création des espèces RNA...');
    const speciesMap = new Map();
    for (const sp of SPECIES_DATA) {
        const created = await prisma.species.create({ data: sp });
        speciesMap.set(sp.scientificName, created.id);
    }
    console.log(`   ✓ ${SPECIES_DATA.length} espèces créées`);
    console.log('📚 Création des formations RNA...');
    for (const f of FORMATIONS_DATA) {
        await prisma.formation.create({
            data: { ...f, isPublished: true, mediaUrls: [] },
        });
    }
    console.log(`   ✓ ${FORMATIONS_DATA.length} formations créées`);
    console.log('👥 Création des utilisateurs...');
    const passwordHash = await bcrypt.hash('Rna2024!', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@rna-guide.bf',
            phone: '+22670000001',
            passwordHash,
            firstName: 'Amadou',
            lastName: 'Ministère',
            role: client_1.Role.ADMIN,
            region: 'Centre-Nord',
            province: 'Sanmatenga',
            isActive: true,
        },
    });
    const superviseurs = [];
    for (let i = 0; i < REGIONS_BF.length; i++) {
        const r = REGIONS_BF[i];
        const sup = await prisma.user.create({
            data: {
                email: `superviseur.${r.region.toLowerCase().replace(' ', '-')}@rna-guide.bf`,
                phone: `+2267001000${i + 1}`,
                passwordHash,
                firstName: random([...PRÉNOMS_M, ...PRÉNOMS_F]),
                lastName: random(NOMS),
                role: client_1.Role.SUPERVISEUR,
                region: r.region,
                province: r.provinces[0].province,
                isActive: true,
            },
        });
        superviseurs.push({ ...sup, regionData: r });
    }
    const agents = [];
    for (const r of REGIONS_BF) {
        for (let i = 0; i < 3; i++) {
            const prov = random(r.provinces);
            const agent = await prisma.user.create({
                data: {
                    email: `agent.${r.region.toLowerCase().replace(/[\s-]/g, '')}.${i + 1}@rna-guide.bf`,
                    phone: `+2267${randomInt(10000000, 99999999)}`,
                    passwordHash,
                    firstName: i % 2 === 0 ? random(PRÉNOMS_M) : random(PRÉNOMS_F),
                    lastName: random(NOMS),
                    role: client_1.Role.AGENT_TERRAIN,
                    region: r.region,
                    province: prov.province,
                    commune: random(prov.communes),
                    deviceId: `device-${Math.random().toString(36).substr(2, 9)}`,
                    appVersion: '1.0.0',
                    lastSyncAt: randomDate(new Date('2025-01-01'), new Date()),
                    isActive: true,
                },
            });
            agents.push({ ...agent, regionData: r });
        }
    }
    const producteurs = [];
    for (let i = 0; i < 50; i++) {
        const r = random(REGIONS_BF);
        const prov = random(r.provinces);
        const commune = random(prov.communes);
        const village = random(VILLAGES);
        const isFemale = i % 3 === 0;
        const prod = await prisma.user.create({
            data: {
                phone: `+2267${randomInt(10000000, 99999999)}`,
                passwordHash,
                firstName: isFemale ? random(PRÉNOMS_F) : random(PRÉNOMS_M),
                lastName: random(NOMS),
                role: client_1.Role.PRODUCTEUR,
                region: r.region,
                province: prov.province,
                commune,
                village,
                deviceId: `device-${Math.random().toString(36).substr(2, 9)}`,
                appVersion: '1.0.0',
                lastSyncAt: randomDate(new Date('2024-06-01'), new Date()),
                isActive: true,
            },
        });
        producteurs.push({ user: prod, region: r, province: prov, commune, village });
    }
    console.log(`   ✓ ${1 + superviseurs.length + agents.length + producteurs.length} utilisateurs créés`);
    console.log(`     Admin: admin@rna-guide.bf / Rna2024!`);
    console.log(`     Superviseur: superviseur.centre-nord@rna-guide.bf / Rna2024!`);
    console.log(`     Agent: agent.centrenord.1@rna-guide.bf / Rna2024!`);
    console.log('🗺️  Création des parcelles RNA...');
    const parcelles = [];
    for (let i = 0; i < 100; i++) {
        const prodData = random(producteurs);
        const { region, province, commune, village } = prodData;
        const prov = random(province.communes);
        const baseLat = region.lat + (Math.random() - 0.5) * 2;
        const baseLng = region.lng + (Math.random() - 0.5) * 2;
        const gps = generateGPSNearPoint(baseLat, baseLng);
        const superficie = randomFloat(0.5, 5.0, 1);
        const gpsPoints = generateParcelGPS(gps.latitude, gps.longitude, superficie);
        const syncStatuses = [client_1.SyncStatus.SYNCED, client_1.SyncStatus.SYNCED, client_1.SyncStatus.SYNCED, client_1.SyncStatus.PENDING];
        const createdAt = randomDate(new Date('2020-01-01'), new Date('2025-12-31'));
        const parcel = await prisma.parcel.create({
            data: {
                localId: `local-${Math.random().toString(36).substr(2, 9)}`,
                name: `Champ RNA ${village} ${i + 1}`,
                region: region.region,
                province: province.province,
                commune: commune,
                village: village,
                superficie,
                latitude: gps.latitude,
                longitude: gps.longitude,
                geometry: { type: 'Polygon', coordinates: [gpsPoints.map(p => [p.lng, p.lat])] },
                gpsPoints,
                ownerId: prodData.user.id,
                syncStatus: random(syncStatuses),
                version: randomInt(1, 5),
                notes: Math.random() > 0.7 ? 'Parcelle en zone protégée. Accord verbal avec chef de village.' : null,
                createdAt,
                updatedAt: createdAt,
            },
        });
        const nbPoints = randomInt(1, 3);
        const photoPoints = [];
        const directions = ['Nord', 'Sud', 'Est', 'Ouest', 'Centre', 'Nord-Est', 'Sud-Ouest'];
        for (let j = 0; j < nbPoints; j++) {
            const pt = generateGPSNearPoint(gps.latitude, gps.longitude, 0.1);
            const pp = await prisma.photoPoint.create({
                data: {
                    parcelId: parcel.id,
                    name: `Point ${random(directions)}`,
                    latitude: pt.latitude,
                    longitude: pt.longitude,
                },
            });
            photoPoints.push(pp);
        }
        parcelles.push({ parcel, photoPoints, gps, prodData });
    }
    console.log(`   ✓ ${parcelles.length} parcelles créées`);
    console.log('📊 Création des inventaires...');
    let totalInventaires = 0;
    const years = [2022, 2023, 2024, 2025];
    const allSpeciesIds = Array.from(speciesMap.values());
    for (const { parcel } of parcelles) {
        const agent = random(agents);
        const nbYears = randomInt(1, 3);
        const selectedYears = years.slice(-nbYears);
        for (const year of selectedYears) {
            const season = random([client_1.Season.HIVERNAGE, client_1.Season.SAISON_SECHE]);
            const nbSpecies = randomInt(2, 6);
            const selectedSpeciesIds = [...allSpeciesIds].sort(() => 0.5 - Math.random()).slice(0, nbSpecies);
            let totalPieds = 0;
            let selectedPieds = 0;
            const speciesData = selectedSpeciesIds.map(speciesId => {
                const total = randomInt(10, 150);
                const selected = randomInt(3, Math.floor(total * 0.6));
                totalPieds += total;
                selectedPieds += selected;
                return {
                    speciesId,
                    totalPieds: total,
                    selectedPieds: selected,
                    healthState: random([client_1.HealthState.BON, client_1.HealthState.BON, client_1.HealthState.MOYEN, client_1.HealthState.MAUVAIS]),
                    heightCm: randomFloat(80, 400),
                    isNewSpecies: Math.random() > 0.85,
                };
            });
            const isValidated = Math.random() > 0.3;
            const createdAt = new Date(`${year}-${randomInt(6, 11)}-${randomInt(1, 28)}`);
            await prisma.inventory.create({
                data: {
                    localId: `inv-${Math.random().toString(36).substr(2, 9)}`,
                    parcelId: parcel.id,
                    agentId: agent.id,
                    year,
                    season,
                    totalPieds,
                    selectedPieds,
                    syncStatus: client_1.SyncStatus.SYNCED,
                    observations: Math.random() > 0.5 ? `Bonne régénération observée. ${randomInt(2, 8)} nouvelles pousses de Faidherbia.` : null,
                    validatedAt: isValidated ? randomDate(createdAt, new Date()) : null,
                    validatedBy: isValidated ? random(superviseurs).id : null,
                    createdAt,
                    updatedAt: createdAt,
                    species: { create: speciesData },
                },
            });
            totalInventaires++;
        }
    }
    console.log(`   ✓ ${totalInventaires} inventaires créés`);
    console.log('📷 Création des photos de suivi...');
    let totalPhotos = 0;
    const fakePhotoUrls = [
        'https://placehold.co/800x600/4a7c59/white?text=RNA+Parcelle',
        'https://placehold.co/800x600/2d6a4f/white?text=Faidherbia+RNA',
        'https://placehold.co/800x600/1b4332/white?text=Inventaire+Terrain',
        'https://placehold.co/800x600/52b788/white?text=Guiera+Senegalensis',
    ];
    for (const { parcel, photoPoints, gps } of parcelles.slice(0, 60)) {
        const nbPhotos = randomInt(1, 4);
        const agent = random(agents);
        for (let i = 0; i < nbPhotos; i++) {
            const pp = photoPoints.length > 0 ? random(photoPoints) : null;
            const takenAt = randomDate(new Date('2022-01-01'), new Date());
            await prisma.photo.create({
                data: {
                    localId: `photo-${Math.random().toString(36).substr(2, 9)}`,
                    parcelId: parcel.id,
                    authorId: agent.id,
                    photoPointId: pp?.id ?? null,
                    storageUrl: random(fakePhotoUrls),
                    thumbnailUrl: random(fakePhotoUrls),
                    latitude: gps.latitude + (Math.random() - 0.5) * 0.001,
                    longitude: gps.longitude + (Math.random() - 0.5) * 0.001,
                    takenAt,
                    syncStatus: client_1.SyncStatus.SYNCED,
                    year: takenAt.getFullYear(),
                    notes: Math.random() > 0.6 ? 'Photo prise au point de référence nord' : null,
                    sizeBytes: randomInt(200000, 3000000),
                    createdAt: takenAt,
                },
            });
            totalPhotos++;
        }
    }
    console.log(`   ✓ ${totalPhotos} photos créées`);
    console.log('🌾 Création des données d\'exploitation...');
    let totalExploitations = 0;
    const PRODUITS_CONFIG = [
        { type: client_1.ProductType.FRUITS, units: ['kg', 'sac', 'botte'], priceRange: [150, 800] },
        { type: client_1.ProductType.FEUILLES, units: ['kg', 'fagot', 'botte'], priceRange: [50, 300] },
        { type: client_1.ProductType.BOIS, units: ['fagot', 'stère', 'kg'], priceRange: [500, 2500] },
        { type: client_1.ProductType.GOUSSES, units: ['kg', 'sac'], priceRange: [200, 600] },
        { type: client_1.ProductType.COMBUSTIBLE, units: ['fagot', 'kg'], priceRange: [300, 1000] },
        { type: client_1.ProductType.ECORCES, units: ['kg', 'botte'], priceRange: [400, 1500] },
    ];
    for (const { parcel, prodData } of parcelles.slice(0, 70)) {
        const nbExploitations = randomInt(1, 5);
        for (let i = 0; i < nbExploitations; i++) {
            const prodConfig = random(PRODUITS_CONFIG);
            const destination = random(['autoconsommation', 'vente', 'autoconsommation', 'don', 'stockage']);
            const isVente = destination === 'vente';
            const exploitedAt = randomDate(new Date('2022-01-01'), new Date());
            await prisma.exploitation.create({
                data: {
                    localId: `expl-${Math.random().toString(36).substr(2, 9)}`,
                    parcelId: parcel.id,
                    userId: prodData.user.id,
                    productType: prodConfig.type,
                    quantity: randomFloat(0.5, 50),
                    unit: random(prodConfig.units),
                    destination,
                    usage: random(['nourriture', 'medecine', 'fourrage', 'bois_chauffe', 'vente_marche']),
                    priceXOF: isVente ? randomInt(prodConfig.priceRange[0], prodConfig.priceRange[1]) : null,
                    buyerInfo: isVente && Math.random() > 0.5 ? 'Marché de Kaya' : null,
                    exploitedAt,
                    syncStatus: client_1.SyncStatus.SYNCED,
                    createdAt: exploitedAt,
                    updatedAt: exploitedAt,
                },
            });
            totalExploitations++;
        }
    }
    console.log(`   ✓ ${totalExploitations} exploitations créées`);
    console.log('\n✅ Seeding terminé avec succès!\n');
    console.log('═══════════════════════════════════════');
    console.log('RÉSUMÉ DES DONNÉES CRÉÉES');
    console.log('═══════════════════════════════════════');
    const counts = await Promise.all([
        prisma.user.count(),
        prisma.parcel.count(),
        prisma.inventory.count(),
        prisma.inventorySpecies.count(),
        prisma.photo.count(),
        prisma.exploitation.count(),
        prisma.species.count(),
        prisma.formation.count(),
    ]);
    console.log(`👤 Utilisateurs     : ${counts[0]}`);
    console.log(`🗺️  Parcelles RNA    : ${counts[1]}`);
    console.log(`📊 Inventaires      : ${counts[2]}`);
    console.log(`🌿 Relevés espèces  : ${counts[3]}`);
    console.log(`📷 Photos terrain   : ${counts[4]}`);
    console.log(`🌾 Exploitations    : ${counts[5]}`);
    console.log(`🌳 Espèces RNA      : ${counts[6]}`);
    console.log(`📚 Formations       : ${counts[7]}`);
    console.log('═══════════════════════════════════════');
    console.log('\n🔐 COMPTES DE TEST:');
    console.log('  Admin      : admin@rna-guide.bf         | Rna2024!');
    console.log('  Superviseur: superviseur.centre-nord@rna-guide.bf | Rna2024!');
    console.log('  Agent      : agent.centrenord.1@rna-guide.bf | Rna2024!');
}
main()
    .catch(e => { console.error('❌ Erreur seed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map