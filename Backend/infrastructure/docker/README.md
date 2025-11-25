# Docker Infrastructure für Monetaris Backend

## Services

Diese Docker Compose Konfiguration startet folgende Services:

### 1. **PostgreSQL** (`postgres:16-alpine`)
- Port: `5432`
- Database: `monetaris`
- User: `monetaris_user`
- Password: `monetaris_pass`

### 2. **pgAdmin** (`dpage/pgadmin4`)
- URL: http://localhost:5050
- Login: admin@monetaris.local / admin
- PostgreSQL Management UI

### 3. **SonarQube** (`sonarqube:community`)
- URL: http://localhost:9000
- Login: admin / admin (beim ersten Start ändern!)
- Code Quality & Static Analysis

### 4. **Redis** (`redis:7-alpine`)
- Port: `6379`
- Caching & Session Storage

### 5. **Seq** (`datalust/seq`)
- URL: http://localhost:5341
- Structured Logging Aggregation

---

## Quick Start

### 1. Environment Variables kopieren
```bash
cp .env.example .env
```

Passe die Werte in `.env` an (insbesondere Passwörter!).

### 2. Services starten
```bash
docker-compose up -d
```

### 3. Services stoppen
```bash
docker-compose down
```

### 4. Services neu starten (mit Volume-Reset)
```bash
docker-compose down -v
docker-compose up -d
```

---

## Service URLs

Nach dem Start sind folgende URLs verfügbar:

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | `monetaris_user` / `monetaris_pass` |
| pgAdmin | http://localhost:5050 | `admin@monetaris.local` / `admin` |
| SonarQube | http://localhost:9000 | `admin` / `admin` |
| Redis | `localhost:6379` | - |
| Seq | http://localhost:5341 | - |

---

## PostgreSQL Verbindung

### Connection String (.NET)
```
Host=localhost;Port=5432;Database=monetaris;Username=monetaris_user;Password=monetaris_pass
```

### Connection in pgAdmin konfigurieren
1. Öffne http://localhost:5050
2. Login mit `admin@monetaris.local` / `admin`
3. **Add New Server**:
   - **General Tab**:
     - Name: `Monetaris Local`
   - **Connection Tab**:
     - Host: `postgres` (Docker Service Name)
     - Port: `5432`
     - Maintenance database: `monetaris`
     - Username: `monetaris_user`
     - Password: `monetaris_pass`
   - **Save**

---

## SonarQube Setup

### Erstes Login
1. Öffne http://localhost:9000
2. Login: `admin` / `admin`
3. Ändere das Passwort (wird beim ersten Login gefordert)

### .NET Scanner installieren
```bash
dotnet tool install --global dotnet-sonarscanner
```

### Projekt scannen
```bash
# 1. Scanner starten
dotnet sonarscanner begin /k:"monetaris" /d:sonar.host.url="http://localhost:9000" /d:sonar.login="<TOKEN>"

# 2. Build
dotnet build

# 3. Scanner abschließen
dotnet sonarscanner end /d:sonar.login="<TOKEN>"
```

**Token generieren:**
- SonarQube → My Account → Security → Generate Token

---

## Seq Setup

### Logs in .NET senden

```csharp
// appsettings.json
{
  "Serilog": {
    "WriteTo": [
      {
        "Name": "Seq",
        "Args": {
          "serverUrl": "http://localhost:5341"
        }
      }
    ]
  }
}
```

### Logs ansehen
Öffne http://localhost:5341 und sieh dir strukturierte Logs in Echtzeit an.

---

## Volumes (Datenpersistenz)

Die Daten werden in Docker Volumes gespeichert:

```bash
# Alle Volumes anzeigen
docker volume ls | grep monetaris

# Volume-Details anzeigen
docker volume inspect monetaris_postgres_data

# Alle Volumes löschen (VORSICHT!)
docker-compose down -v
```

---

## Troubleshooting

### PostgreSQL startet nicht
```bash
# Logs anzeigen
docker logs monetaris-db

# Container neu starten
docker-compose restart postgres
```

### Port bereits belegt
Wenn Port 5432 bereits belegt ist, ändere in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Lokal auf 5433 mappen
```

### SonarQube startet nicht
SonarQube benötigt mindestens **2GB RAM**. Erhöhe Docker Memory Limit:
- Docker Desktop → Settings → Resources → Memory

### Alle Logs anzeigen
```bash
docker-compose logs -f
```

---

## Backup & Restore

### PostgreSQL Backup erstellen
```bash
docker exec -t monetaris-db pg_dump -U monetaris_user monetaris > backup.sql
```

### PostgreSQL Backup wiederherstellen
```bash
docker exec -i monetaris-db psql -U monetaris_user monetaris < backup.sql
```

---

## Production Setup

Für Production solltest du:

1. **Starke Passwörter** in `.env` setzen
2. **SSL/TLS** für PostgreSQL aktivieren
3. **Separate Docker Compose** Datei erstellen (`docker-compose.production.yml`)
4. **Secrets Management** (z.B. Docker Secrets, Azure Key Vault)
5. **Backup Strategy** implementieren
6. **Monitoring** hinzufügen (z.B. Prometheus + Grafana)

---

## Weitere Befehle

```bash
# Alle Container stoppen
docker-compose stop

# Einzelnen Service neu starten
docker-compose restart postgres

# Container entfernen (Daten bleiben)
docker-compose down

# Container + Volumes entfernen (Daten werden gelöscht!)
docker-compose down -v

# Logs eines Services anzeigen
docker-compose logs -f postgres

# Shell in Container öffnen
docker exec -it monetaris-db psql -U monetaris_user -d monetaris
```

---

**Ready to develop! 🚀**
