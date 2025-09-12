# Sensors API

Panduan integrasi endpoint sensor untuk FE. Semua response dibungkus `{ status, data, metadata }`. Waktu dalam ISO UTC. Filter rentang waktu menggunakan [from, to) (to eksklusif).

Base URL (dev): `http://localhost:8000`

## Autentikasi
- Gunakan `Authorization: Bearer <token>`.

## Endpoints

### 1) Latest
- `GET /sensors/{deviceId}/latest`
- Response contoh:
```
{
  "status": "success",
  "data": {
    "time": "2024-09-01T12:34:56.000Z",
    "timestamp": "2024-09-01T12:34:55.000Z",
    "device_id": "SMNR-0001",
    "temperature": { "value": 26.4, "calibrated": 26.4, "status": "GOOD" },
    "ph": { "value": 7.3, "calibrated": 7.31, "status": "GOOD" },
    "tds": { "value": 420, "calibrated": 415, "status": "GOOD" },
    "do_level": { "value": 8.2, "calibrated": 8.25, "status": "GOOD" }
  },
  "metadata": { "deviceId": "SMNR-0001" }
}
```

### 2) History
- `GET /sensors/{deviceId}/history`
- Query:
  - `page`, `limit` (offset mode) atau `cursor` (keyset mode)
  - `from`, `to` (ISO UTC; [from,to))
  - `orderBy` = `ASC|DESC` (default `DESC`)
  - `fields` (mis. `temperature,ph`) dan `format` = `entity|flat`
- Contoh (offset + flat):
```
GET /sensors/SMNR-0001/history?from=2024-09-01T00:00:00Z&to=2024-09-02T00:00:00Z&limit=100&orderBy=DESC&format=flat&fields=temperature,ph
{
  "status": "success",
  "data": [
    { "time": "2024-09-01T00:00:00.000Z", "temperature": 26.1, "ph": 7.2 },
    { "time": "2024-09-01T00:05:00.000Z", "temperature": 26.2, "ph": 7.25 }
  ],
  "metadata": { "total": 1200, "page": 1, "limit": 100, "totalPages": 12, "hasNext": true, "nextCursor": null, "from": "2024-09-01T00:00:00Z", "to": "2024-09-02T00:00:00Z", "orderBy": "DESC" }
}
```
- Contoh (keyset cursor):
```
GET /sensors/SMNR-0001/history?from=2024-09-01T00:00:00Z&to=2024-09-02T00:00:00Z&limit=100&orderBy=DESC&cursor=2024-09-01T00:10:00Z
{
  "status": "success",
  "data": [ ... ],
  "metadata": { "total": null, "page": null, "limit": 100, "totalPages": null, "hasNext": true, "nextCursor": "2024-09-01T00:15:00.000Z", "from": "2024-09-01T00:00:00Z", "to": "2024-09-02T00:00:00Z", "orderBy": "DESC" }
}
```

### 3) Aggregate
- `GET /sensors/{deviceId}/aggregate`
- Query: `from`, `to`, `granularity=hourly|daily`, `orderBy=ASC|DESC`, `page`, `limit`
- Catatan: default `orderBy=ASC` (siap chart). Data diambil dari Timescale continuous aggregate.
- Contoh:
```
GET /sensors/SMNR-0001/aggregate?from=2024-08-01T00:00:00Z&to=2024-09-01T00:00:00Z&granularity=daily&orderBy=ASC
{
  "status": "success",
  "data": [
    { "bucket": "2024-08-01T00:00:00.000Z", "avg_temperature": 26.2, "avg_ph": 7.22, "avg_tds": 415, "avg_do_level": 8.1 }
  ],
  "metadata": { "total": 31, "page": 1, "limit": 31, "totalPages": 1, "granularity": "daily", "from": "2024-08-01T00:00:00Z", "to": "2024-09-01T00:00:00Z", "orderBy": "ASC", "hasNext": false }
}
```

### 4) Series (Graph-Ready)
- `GET /sensors/{deviceId}/series`
- Query:
  - `from`, `to` (ISO UTC; [from,to))
  - `granularity=auto|hourly|daily` (default `auto`)
  - `metrics` (mis. `temperature,ph,tds,do_level`)
  - `order=ASC|DESC` (default `ASC`), `maxPoints` (10–2000, default 500)
  - `fill=none|gaps` (default `none`), `format=series|flat` (default `series`)
- Response (series):
```
{
  "status": "success",
  "data": [
    { "metric": "temperature", "unit": "C", "points": [["2024-08-01T00:00:00.000Z", 26.2]] }
  ],
  "metadata": { "from": "2024-08-01T00:00:00Z", "to": "2024-08-02T00:00:00Z", "granularity": "hourly", "effectiveGranularity": "hourly", "order": "ASC", "maxPoints": 500, "downsampled": false }
}
```
- Response (flat):
```
{
  "status": "success",
  "data": { "metrics": ["temperature", "ph"], "points": [["2024-08-01T00:00:00.000Z", 26.2, 7.2]] },
  "metadata": { ... sama seperti di atas ... }
}
```
- Units: temperature=C, ph=unitless, tds=ppm, do_level=mg/L.
- Gap fill: `fill=gaps` mengaktifkan `time_bucket_gapfill` agar titik waktu konsisten; default `fill=none`.

## Catatan Integrasi FE
- Gunakan `/series` (order ASC) untuk chart; set `granularity=auto`, atur `maxPoints` sesuai kebutuhan, pilih `metrics` sesuai toggles.
- Untuk tabel, gunakan `/history?format=flat&fields=...` untuk payload ringan.
- Keyset pagination: gunakan `cursor` dan `nextCursor` untuk infinite scroll.
- Caching: `/aggregate` dan `/series` mendukung ETag/Last-Modified + `Cache-Control: public, max-age=300`.

