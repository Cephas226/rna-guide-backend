# RNA Guide — Backend NestJS

Backend API REST pour la plateforme de Régénération Naturelle Assistée au Burkina Faso.

## Stack technique

- **NestJS** 10 — framework modulaire
- **Prisma** ORM — PostgreSQL (Neon)
- **JWT** — access token 15min + refresh token 30j avec rotation
- **Passport** — stratégies JWT & Local
- **Swagger** — documentation auto sur `/api/docs`
- **Supabase Storage** — stockage photos terrain

## Installation rapide

```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Remplir DATABASE_URL (Neon), JWT_ACCESS_SECRET, SUPABASE_URL...

# 3. Pousser le schéma vers la base de données
npm run prisma:push

# 4. Générer le client Prisma
npm run prisma:generate

# 5. Seeder avec les données de démonstration
npm run seed

# 6. Démarrer en développement
npm run start:dev
```

## API Documentation

Swagger disponible sur : `http://localhost:3000/api/docs`

## Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/register` | Inscription |
| POST | `/api/v1/auth/login` | Connexion |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/parcels` | Lister les parcelles |
| POST | `/api/v1/parcels` | Créer une parcelle |
| GET | `/api/v1/parcels/geojson` | Export GeoJSON pour Leaflet |
| POST | `/api/v1/sync/push` | Push offline → serveur |
| GET | `/api/v1/sync/pull?lastSyncAt=` | Pull deltas |
| GET | `/api/v1/analytics/overview` | KPIs dashboard |

## Comptes de test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@rna-guide.bf | Rna2024! |
| Superviseur | superviseur.centre-nord@rna-guide.bf | Rna2024! |
| Agent | agent.centrenord.1@rna-guide.bf | Rna2024! |

## Architecture des modules

```
src/
├── modules/
│   ├── auth/           # JWT, refresh tokens, RBAC
│   ├── users/          # Gestion utilisateurs
│   ├── parcels/        # Parcelles RNA (CRUD + GeoJSON)
│   ├── inventory/      # Inventaires espèces
│   ├── exploitation/   # Produits PFNL/ligneux
│   ├── media/          # Upload photos Supabase
│   ├── sync/           # Synchronisation offline-first
│   ├── analytics/      # Dashboard statistiques
│   └── formations/     # Guides RNA multilingues
├── common/
│   ├── decorators/     # @CurrentUser, @Roles, @Public
│   ├── filters/        # HttpExceptionFilter global
│   ├── guards/         # JwtAuthGuard, RolesGuard
│   └── interceptors/   # Transform + Logging
└── prisma/             # PrismaService global
```

## Stratégie Sync Offline-First

1. **PUSH** (`POST /sync/push`) — le mobile envoie un batch de mutations (create/update/delete) avec `localId` et `clientUpdatedAt`
2. **Détection conflit** — si `serverVersion > clientVersion` → conflit signalé (Server Wins par défaut)
3. **PULL** (`GET /sync/pull?lastSyncAt=ISO`) — retourne uniquement les deltas depuis le timestamp
4. **Resolution** (`POST /sync/resolve/:id`) — résolution manuelle par superviseur
5. **SyncLog** — tout est tracé pour audit et reporting
