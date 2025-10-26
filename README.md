# 🎉 EventSphere - Plataforma de Gestión de Eventos

EventSphere es una plataforma web dinámica que combina la gestión de eventos con la interacción social, permitiendo a los usuarios crear, descubrir y participar en eventos de diferentes categorías.

## 📋 Tabla de Contenidos
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Uso](#uso)

## ✨ Características

### 🔐 Autenticación y Usuarios
- Registro de usuarios con validación
- Inicio de sesión
- Gestión de perfil
- Roles de usuario (USER, ADMIN, ORGANIZADOR)

### 🎪 Gestión de Eventos
- Crear eventos con información detallada
- Subida de imágenes para eventos
- Categorización (Música, Deportes, Conferencias, Arte y Cultura, Gastronomía)
- Búsqueda y filtrado de eventos
- Vista detallada de eventos
- Seguimiento de disponibilidad (entradas vendidas/capacidad)

### 🎫 Sistema de Boletos
- Compra de boletos online
- Generación automática de códigos QR
- Visualización de boletos comprados
- Estados de boletos (ACTIVO, USADO, CANCELADO)
- Cancelación de boletos

### ⭐ Sistema de Reseñas
- Calificación de eventos (1-5 estrellas)
- Comentarios y opiniones
- Cálculo de promedio de calificaciones
- Validación (una reseña por usuario/evento)

### 💬 Chat por Evento
- Sistema de mensajería en tiempo real por evento
- Interfaz estilo chat
- Identificación de mensajes propios vs otros usuarios
- Historial de conversación

## 🛠️ Tecnologías

### Backend
- **Java 21**
- **Spring Boot 3.4.12**
- **Spring Data JPA**
- **Hibernate 6.6.33**
- **Oracle Database 21.3**
- **Maven 3.9.11**
- **Lombok**

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Bootstrap 5.3.0**
- **Bootstrap Icons**

### Base de Datos
- **Oracle Database 21.3**
- **HikariCP** (Connection Pooling)

## 📦 Requisitos Previos

- **JDK 21** o superior
- **Maven 3.9+**
- **Oracle Database 21.3**
- **Docker** (si ejecutas Oracle en contenedor)

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Kathya-P/eventspheree.git
cd eventsphere
```

### 2. Configurar Oracle Database

#### Opción A: Usando Docker
```bash
docker run -d --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=eventpass123 \
  gvenzl/oracle-xe:21.3.0-slim
```

#### Opción B: Instalación local
Instala Oracle Database 21.3 y crea el usuario:
```sql
CREATE USER eventsphere IDENTIFIED BY eventpass123;
GRANT CONNECT, RESOURCE, DBA TO eventsphere;
```

### 3. Configurar application.properties
Edita `src/main/resources/application.properties`:

```properties
# Oracle Database
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:XE
spring.datasource.username=eventsphere
spring.datasource.password=eventpass123

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 4. Compilar y ejecutar
```bash
mvn clean package -DskipTests
mvn spring-boot:run
```

La aplicación estará disponible en: **http://localhost:8080**

## ⚙️ Configuración

### Variables de Entorno (Opcional)
```bash
export DB_HOST=localhost
export DB_PORT=1521
export DB_NAME=XE
export DB_USER=eventsphere
export DB_PASSWORD=eventpass123
```

### Categorías Pre-cargadas
Al iniciar la aplicación, se crean automáticamente 5 categorías:
- 🎵 Música
- 🏆 Deportes
- 🎤 Conferencias
- 🎨 Arte y Cultura
- ☕ Gastronomía

## 📁 Estructura del Proyecto

```
eventsphere/
├── src/
│   ├── main/
│   │   ├── java/com/eventsphere/
│   │   │   ├── model/              # Entidades JPA
│   │   │   │   ├── Usuario.java
│   │   │   │   ├── Evento.java
│   │   │   │   ├── Categoria.java
│   │   │   │   ├── Boleto.java
│   │   │   │   ├── Resena.java
│   │   │   │   ├── Foto.java
│   │   │   │   └── Mensaje.java
│   │   │   ├── repository/         # Repositorios Spring Data
│   │   │   ├── service/            # Lógica de negocio
│   │   │   ├── controller/         # REST Controllers
│   │   │   ├── config/             # Configuración
│   │   │   └── eventsphere/        # Clase principal
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/             # Frontend
│   │           ├── index.html
│   │           ├── registro.html
│   │           ├── login.html
│   │           ├── crear-evento.html
│   │           ├── evento-detalle.html
│   │           ├── mi-perfil.html
│   │           ├── css/styles.css
│   │           ├── js/
│   │           │   ├── api.js
│   │           │   ├── index.js
│   │           │   ├── registro.js
│   │           │   ├── login.js
│   │           │   ├── crear-evento.js
│   │           │   ├── evento-detalle.js
│   │           │   └── mi-perfil.js
│   │           └── uploads/eventos/ # Imágenes subidas
│   └── test/
└── pom.xml
```

## 🔌 API Endpoints

### Usuarios
```
POST   /api/usuarios              - Crear usuario
GET    /api/usuarios              - Listar usuarios
GET    /api/usuarios/{id}         - Buscar por ID
GET    /api/usuarios/username/{username} - Buscar por username
PUT    /api/usuarios/{id}         - Actualizar usuario
DELETE /api/usuarios/{id}         - Eliminar usuario
```

### Eventos
```
POST   /api/eventos                      - Crear evento (JSON)
POST   /api/eventos/crear-con-imagen     - Crear evento con imagen
GET    /api/eventos                      - Listar todos
GET    /api/eventos/{id}                 - Buscar por ID
GET    /api/eventos/proximos             - Eventos próximos
GET    /api/eventos/buscar?keyword=      - Buscar por título
PUT    /api/eventos/{id}                 - Actualizar evento
PUT    /api/eventos/{id}/cancelar        - Cancelar evento
DELETE /api/eventos/{id}                 - Eliminar evento
```

### Categorías
```
GET    /api/categorias                   - Listar categorías
GET    /api/categorias/{id}              - Buscar por ID
```

### Boletos
```
POST   /api/boletos/comprar              - Comprar boleto
GET    /api/boletos/usuario/{id}         - Boletos del usuario
GET    /api/boletos/evento/{id}          - Boletos del evento
GET    /api/boletos/{id}                 - Buscar por ID
GET    /api/boletos/qr/{codigo}          - Buscar por QR
POST   /api/boletos/{id}/usar            - Usar boleto
DELETE /api/boletos/{id}                 - Cancelar boleto
```

### Reseñas
```
POST   /api/resenas                      - Crear reseña
GET    /api/resenas/evento/{id}          - Reseñas del evento
GET    /api/resenas/evento/{id}/promedio - Promedio y total
GET    /api/resenas/{id}                 - Buscar por ID
PUT    /api/resenas/{id}                 - Actualizar reseña
DELETE /api/resenas/{id}                 - Eliminar reseña
```

### Mensajes
```
POST   /api/mensajes                     - Enviar mensaje
GET    /api/mensajes/evento/{id}         - Mensajes del evento
GET    /api/mensajes/{id}                - Buscar por ID
DELETE /api/mensajes/{id}                - Eliminar mensaje
```

## 🗄️ Base de Datos

### Modelo de Datos

#### Tabla: USUARIOS
```sql
CREATE TABLE USUARIOS (
    id NUMBER(19) PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL,
    rol VARCHAR2(20),
    fecha_registro TIMESTAMP
);
```

#### Tabla: CATEGORIAS
```sql
CREATE TABLE CATEGORIAS (
    id NUMBER(19) PRIMARY KEY,
    nombre VARCHAR2(50) UNIQUE NOT NULL,
    descripcion VARCHAR2(255),
    icono VARCHAR2(50)
);
```

#### Tabla: EVENTOS
```sql
CREATE TABLE EVENTOS (
    id NUMBER(19) PRIMARY KEY,
    titulo VARCHAR2(200) NOT NULL,
    descripcion VARCHAR2(2000),
    fecha_evento TIMESTAMP NOT NULL,
    lugar VARCHAR2(200) NOT NULL,
    direccion VARCHAR2(500),
    capacidad NUMBER(10) NOT NULL,
    precio NUMBER(10,2) NOT NULL,
    entradas_vendidas NUMBER(10),
    estado VARCHAR2(20) NOT NULL,
    imagen_url VARCHAR2(500),
    fecha_creacion TIMESTAMP,
    categoria_id NUMBER(19) NOT NULL REFERENCES CATEGORIAS(id),
    organizador_id NUMBER(19) NOT NULL REFERENCES USUARIOS(id)
);
```

#### Tabla: BOLETOS
```sql
CREATE TABLE BOLETOS (
    id NUMBER(19) PRIMARY KEY,
    codigoqr VARCHAR2(100) UNIQUE NOT NULL,
    estado VARCHAR2(20) NOT NULL,
    fecha_compra TIMESTAMP,
    fecha_uso TIMESTAMP,
    usuario_id NUMBER(19) NOT NULL REFERENCES USUARIOS(id),
    evento_id NUMBER(19) NOT NULL REFERENCES EVENTOS(id)
);
```

#### Tabla: RESENAS
```sql
CREATE TABLE RESENAS (
    id NUMBER(19) PRIMARY KEY,
    calificacion NUMBER(10) NOT NULL,
    comentario VARCHAR2(1000),
    fecha_creacion TIMESTAMP,
    usuario_id NUMBER(19) NOT NULL REFERENCES USUARIOS(id),
    evento_id NUMBER(19) NOT NULL REFERENCES EVENTOS(id)
);
```

#### Tabla: MENSAJES
```sql
CREATE TABLE MENSAJES (
    id NUMBER(19) PRIMARY KEY,
    contenido VARCHAR2(1000) NOT NULL,
    fecha_envio TIMESTAMP,
    usuario_id NUMBER(19) NOT NULL REFERENCES USUARIOS(id),
    evento_id NUMBER(19) NOT NULL REFERENCES EVENTOS(id)
);
```

#### Tabla: FOTOS
```sql
CREATE TABLE FOTOS (
    id NUMBER(19) PRIMARY KEY,
    url VARCHAR2(500) NOT NULL,
    descripcion VARCHAR2(255),
    fecha_subida TIMESTAMP,
    usuario_id NUMBER(19) NOT NULL REFERENCES USUARIOS(id),
    evento_id NUMBER(19) NOT NULL REFERENCES EVENTOS(id)
);
```

## 📖 Uso

### 1. Registro de Usuario
1. Ir a http://localhost:8080/registro.html
2. Completar el formulario
3. Hacer clic en "Registrarse"

### 2. Iniciar Sesión
1. Ir a http://localhost:8080/login.html
2. Ingresar username y password
3. La sesión se guarda en localStorage

### 3. Crear un Evento
1. Ir a http://localhost:8080/crear-evento.html
2. Completar los campos requeridos
3. Seleccionar una categoría
4. Subir una imagen (opcional)
5. Hacer clic en "Crear Evento"

### 4. Comprar un Boleto
1. Navegar a un evento desde la página principal
2. Hacer clic en "Comprar Boleto"
3. Confirmar la compra
4. El boleto aparecerá en "Mi Perfil"

### 5. Dejar una Reseña
1. Ir al detalle del evento
2. Ir a la pestaña "Reseñas"
3. Seleccionar calificación (1-5 estrellas)
4. Escribir un comentario (opcional)
5. Hacer clic en "Publicar Reseña"

### 6. Chatear en un Evento
1. Ir al detalle del evento
2. Ir a la pestaña "Chat"
3. Escribir un mensaje
4. Hacer clic en "Enviar"

## 🔍 Consultas SQL Útiles

### Ver estadísticas de eventos
```sql
SELECT 
    e.titulo,
    e.capacidad,
    e.entradas_vendidas,
    ROUND((e.entradas_vendidas / e.capacidad) * 100, 2) as porcentaje_vendido,
    COUNT(DISTINCT r.id) as total_resenas,
    AVG(r.calificacion) as calificacion_promedio
FROM EVENTOS e
LEFT JOIN RESENAS r ON e.id = r.evento_id
GROUP BY e.titulo, e.capacidad, e.entradas_vendidas;
```

### Ver usuarios más activos
```sql
SELECT 
    u.username,
    COUNT(DISTINCT e.id) as eventos_creados,
    COUNT(DISTINCT b.id) as boletos_comprados,
    COUNT(DISTINCT r.id) as resenas_escritas,
    COUNT(DISTINCT m.id) as mensajes_enviados
FROM USUARIOS u
LEFT JOIN EVENTOS e ON u.id = e.organizador_id
LEFT JOIN BOLETOS b ON u.id = b.usuario_id
LEFT JOIN RESENAS r ON u.id = r.usuario_id
LEFT JOIN MENSAJES m ON u.id = m.usuario_id
GROUP BY u.username
ORDER BY eventos_creados DESC;
```

## 📝 Notas Importantes

- Las imágenes se guardan en `src/main/resources/static/uploads/eventos/`
- Los códigos QR se generan automáticamente al comprar un boleto
- El modo `ddl-auto=update` preserva los datos entre reinicios
- CORS está habilitado para desarrollo (`@CrossOrigin(origins = "*")`)

## 🚧 Mejoras Futuras

- [ ] Implementar Spring Security con JWT
- [ ] Sistema de roles y permisos
- [ ] Notificaciones push
- [ ] Integración con pasarelas de pago
- [ ] Chat en tiempo real con WebSockets
- [ ] Sistema de galería de fotos completo
- [ ] Exportación de boletos a PDF
- [ ] Estadísticas para organizadores
- [ ] Búsqueda avanzada con filtros
- [ ] Sistema de favoritos

## 👥 Autores

- **Kathya-P** - [GitHub](https://github.com/Kathya-P)
- **Justin** - [GitHub](https://github.com/jusslemus)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
