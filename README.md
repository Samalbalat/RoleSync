# RoleSync

RoleSync es una aplicación backend desarrollada en **Java (Spring Boot)** cuyo objetivo es mejorar la experiencia de *roleplay escrito* y gestionar conflictos de horarios en juegos de rol de mesa.

---

## 📌 Índice

- 🔍 ¿Qué es RoleSync?
- 🧱 Arquitectura del proyecto
- 📂 Entidades principales
- ⚙️ Endpoints implementados
- 🔧 Requisitos y configuración
- 🧪 Cómo probar
- 📄 Licencia

---

## 🔍 ¿Qué es RoleSync?

RoleSync es un proyecto backend enfocado en:

- Manejar perfiles de participantes (usuarios, personajes, director de juego).
- Manejar campañas sean de rol de mesa o escrito de forma sencilla y adaptada a cada grupo
- Crear un sistema de reseñas real, fiable y dinámico que represente verazmente a los usuarios y sus opiniones
- Recompensar a los usuarios por el uso y buen uso de la propia aplicación
- Sincronizar y organizar *roleplay escrito* en comunidades de juego.
- Resolver y administrar conflictos de horario y planificación de partidas de juego de mesa.
- Dar espacio como foro público para poder compartir nociones, recomendaciones y conversaciones sobre la materia de la aplicación

---

## 🧱 Arquitectura del proyecto

El proyecto sigue la arquitectura estándar de un backend en Spring Boot:

  - src/main/java/com/rolesync/rolseync
  - config: Se encuentra el .java que gestiona la seguridad de la página
  - controller: Controladores que manejan los endpoints
  - dto: Distintos DTOs que utiliza cada controlador
  - repository: Repositorios que manejan la conexión entre los controladores y la base de Datos de PostgreSQL
  - security: Un conjunto de entidades dedicadas al manejo de JWT y la clase User que gestiona la seguridad de la página
  - utils: Varias clases con funciones genéricas y desacopladas del resto de entidades

---

## 📂 Entidades principales

---

## 🔧 Requisitos y configuración

Necesitaras tener PostgreSQL instalado, Java 21, Maven y adecuar el archivo application.properties a una base de datos limpia para que se puedan crear las tablas inciales de la aplicación
---
## 🧪 Cómo probar
Se puede testear mediante el uso de Bruno, Insomnia o Postman con llamadas a la dirección de localhost




