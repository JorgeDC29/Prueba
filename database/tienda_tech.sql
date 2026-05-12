CREATE DATABASE IF NOT EXISTS tienda_tech;
USE tienda_tech;

CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  tipo_cuenta ENUM('usuario', 'empresa') NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo'
);

CREATE TABLE empresas (
  id_empresa INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  nombre_empresa VARCHAR(120) NOT NULL,
  descripcion TEXT,
  logo VARCHAR(255),
  telefono VARCHAR(30),
  direccion VARCHAR(255),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  id_categoria INT,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  imagen VARCHAR(255),
  estrellas INT DEFAULT 3,
  stock INT DEFAULT 0,
  fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE favoritos (
  id_favorito INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_producto INT NOT NULL,
  fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

INSERT INTO categorias (nombre_categoria) VALUES
('Tecnologia'),
('Gaming'),
('Audio'),
('Oficina'),
('Hogar');
