CREATE DATABASE prueba;

-- Crear la tabla Roles
CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    level INTEGER NOT NULL
);

-- Insertar los roles Admin y Consulta
INSERT INTO Roles (name, level) VALUES ('Admin', 99), ('Consulta', 10);

-- Crear la tabla Users
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INTEGER REFERENCES Roles(id),
    access_token VARCHAR(255),
    status BOOLEAN
);

-- Crear la tabla warehouse
CREATE TABLE warehouse (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    capacity INTEGER
);

-- Crear la tabla Product
CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    price FLOAT
);

-- Crear la tabla Item
CREATE TABLE Item (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouse(id),
    product_id INTEGER REFERENCES Product(id)
);

-- Crear la tabla Movimiento
CREATE TABLE Movimiento (
    id SERIAL PRIMARY KEY,
    date DATE,
    origin INTEGER REFERENCES warehouse(id),
    destination INTEGER REFERENCES warehouse(id),
    product_id INTEGER REFERENCES Product(id),
    quantity INTEGER
);


-- Insertar usuario 1
INSERT INTO Users (username, password, rol_id, access_token, status) 
VALUES ('usuario1', 'password1', 1, 'token1', true);

-- Insertar usuario 2
INSERT INTO Users (username, password, rol_id, access_token, status) 
VALUES ('usuario2', 'password2', 2, 'token2', true);

-- Insertar usuario 3
INSERT INTO Users (username, password, rol_id, access_token, status) 
VALUES ('usuario3', 'password3', 2, 'token3', true);
