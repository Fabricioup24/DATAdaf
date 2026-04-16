# Especificaciones Técnicas del Servidor - DATAdaf

Este documento detalla la infraestructura del servidor VPS donde se hospeda el proyecto DATAdaf.

## 1. Información del Sistema
- **Sistema Operativo:** AlmaLinux 9.7 (Moss Jungle Cat) - Basado en RHEL.
- **Arquitectura:** x86_64.
- **Kernel:** 5.14.0 o superior.

## 2. Recursos de Hardware
- **CPU:** nproc (vCPUs disponibles).
- **Memoria RAM:** 7.5 GiB Total (~6.2 GiB disponibles para cache/apps).
- **Swap:** 4.0 GiB.
- **Almacenamiento:** 237 GiB (/dev/sda2), con ~206 GiB libres.

## 3. Configuración de Red
- **IP Pública (Cloudflare):** `162.240.152.210`
- **IP Privada (Tailscale):** `100.126.187.123`
- **Puerto SSH:** `22022`

## 4. Stack de Software y Servicios
- **Web Server:** Nginx 1.20.1 (Proxy) + Apache 2.4.66 (vía cPanel).
- **Control Panel:** cPanel/WHM.
- **Runtime:** Node.js (detectado vía Next.js en puerto 3000).
- **Bases de Datos:**
  - PostgreSQL 18.3 (Puerto 5432).
  - MySQL 8.0.45 (Puerto 3306).
- **Cache/NoSQL:** Valkey (5 instancias activas, puertos 6379-6383).
- **Seguridad:** Tailscale, ConfigServer Firewall (LFD/CSF), Imunify360.

## 5. Directorios y Usuarios de Despliegue
- **Directorio:** `/home/cpolista`
- **Usuario de Despliegue (SSH):** `cpolista` (No usar root para despliegues automáticos).
- **Otros usuarios en /home:** `wwmedi`, `rawrlabs`, `leoleon`.

## 6. Mapeo de Puertos Críticos
| Puerto | Servicio | Notas |
| :--- | :--- | :--- |
| 80/443 | Nginx | Tráfico Web Público |
| 3000 | Next.js | Ocupado por ClinicApp |
| 3001 | DATAdaf | Sugerido para este proyecto |
| 5432 | PostgreSQL | Base de Datos relacional |
| 6379 | Valkey | Reemplazo de Redis |
| 22022 | SSH | Acceso remoto seguro |
