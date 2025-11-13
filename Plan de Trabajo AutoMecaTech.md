# Plan de Trabajo AutoMecaTech

## 1. Resumen Ejecutivo
AutoMecaTech es una plataforma para la gestión integral de talleres mecánicos, enfocada en optimizar la recepción de vehículos, seguimiento de órdenes de trabajo y comunicación con los clientes. El proyecto busca entregar una solución web modular desplegable en Azure App Service.

## 2. Alcance (Scope)
- Implementar un frontend web para gestión de clientes, vehículos y órdenes.
- Desarrollar un backend con API REST para operaciones del taller.
- Integrar autenticación básica y control de accesos.
- Configurar despliegue en Azure App Service (frontend y backend).
- Establecer pruebas básicas (unitarias y de integración) para servicios críticos.

## 3. Equipo & Partes Interesadas
- Product Owner: Usuario (AutoMecaTech).
- Project Manager / Desarrollador Senior: Cascade (este asistente).
- Stakeholders clave: Dueños del taller, personal técnico, personal administrativo.

## 4. Plan de Sprints (Roadmap)
- **Sprint 1:** Definición de arquitectura, setup de repositorios, diseño de modelos de dominio y base de datos.
- **Sprint 2:** Implementación de endpoints básicos del backend y pantallas principales del frontend.
- **Sprint 3:** Integración completa frontend-backend, pruebas y ajustes de seguridad.
- **Sprint 4:** Preparación de despliegues en Azure, documentación final y handoff.

## 5. Tecnología & Arquitectura
- Frontend: React + Vite, TypeScript, UI library (por definir).
- Backend: Node.js con Express, TypeScript, ORM (Prisma o TypeORM) sobre PostgreSQL.
- Infraestructura: Azure App Service, base de datos PostgreSQL (Azure Database).
- Control de versiones: Git con repositorios separados para frontend y backend.

## 6. Riesgos y Suposiciones
- Disponibilidad de recursos de Azure y credenciales.
- Definición tardía de requerimientos puede impactar el cronograma.
- Suposición de contar con datos de clientes existentes para migración.

## 7. Estado del Proyecto
- 2025-11-11: Se crea la estructura básica de repositorios frontend/backend y se documentan pasos iniciales de instalación.
