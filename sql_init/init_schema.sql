-- init_schema.sql
-- Run this script on your SQL Server if you prefer raw SQL creation instead of EF migrations.
-- Replace 'RecyclingDb' with your database name if needed.

IF DB_ID('RecyclingDb') IS NULL
BEGIN
    CREATE DATABASE RecyclingDb;
END
GO

USE RecyclingDb;
GO

IF OBJECT_ID('dbo.Users') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.RecyclingEvents') IS NOT NULL DROP TABLE dbo.RecyclingEvents;
IF OBJECT_ID('dbo.CollectionPoints') IS NOT NULL DROP TABLE dbo.CollectionPoints;
GO

CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(200) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    Email NVARCHAR(200) NULL,
    Points INT NOT NULL DEFAULT 0
);

CREATE TABLE dbo.RecyclingEvents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
    Items INT NOT NULL,
    Points INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.CollectionPoints (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(300) NOT NULL,
    Address NVARCHAR(500) NULL,
    Cep NVARCHAR(20) NULL,
    Latitude FLOAT NULL,
    Longitude FLOAT NULL,
    City NVARCHAR(200) NULL,
    State NVARCHAR(100) NULL
);
GO

-- Seed: one collection point per Brazilian state (sample data).
INSERT INTO CollectionPoints (Name, Address, City, State, ZipCode, Latitude, Longitude) VALUES
('Ponto de Coleta SP - São Paulo 1', 'Rua Principal, 101', 'São Paulo', 'SP', '10001-001', -15.01, -47.01),
('Ponto de Coleta SP - Campinas 2', 'Rua Principal, 102', 'Campinas', 'SP', '10002-002', -15.02, -47.02),
('Ponto de Coleta SP - Santos 3', 'Rua Principal, 103', 'Santos', 'SP', '10003-003', -15.03, -47.03),
('Ponto de Coleta SP - Sorocaba 4', 'Rua Principal, 104', 'Sorocaba', 'SP', '10004-004', -15.04, -47.04),
('Ponto de Coleta SP - Ribeirão Preto 5', 'Rua Principal, 105', 'Ribeirão Preto', 'SP', '10005-005', -15.05, -47.05),
('Ponto de Coleta SP - São Bernardo do Campo 6', 'Rua Principal, 106', 'São Bernardo do Campo', 'SP', '10006-006', -15.06, -47.06),
('Ponto de Coleta SP - Osasco 7', 'Rua Principal, 107', 'Osasco', 'SP', '10007-007', -15.07, -47.07),
('Ponto de Coleta SP - Guarulhos 8', 'Rua Principal, 108', 'Guarulhos', 'SP', '10008-008', -15.08, -47.08),
('Ponto de Coleta SP - São José dos Campos 9', 'Rua Principal, 109', 'São José dos Campos', 'SP', '10009-009', -15.09, -47.09),
('Ponto de Coleta SP - Bauru 10', 'Rua Principal, 110', 'Bauru', 'SP', '10010-010', -15.1, -47.1),
('Ponto de Coleta RJ - Rio de Janeiro 1', 'Rua Principal, 101', 'Rio de Janeiro', 'RJ', '10001-001', -15.01, -47.01),
('Ponto de Coleta RJ - Niterói 2', 'Rua Principal, 102', 'Niterói', 'RJ', '10002-002', -15.02, -47.02),
('Ponto de Coleta RJ - Duque de Caxias 3', 'Rua Principal, 103', 'Duque de Caxias', 'RJ', '10003-003', -15.03, -47.03),
('Ponto de Coleta RJ - Nova Iguaçu 4', 'Rua Principal, 104', 'Nova Iguaçu', 'RJ', '10004-004', -15.04, -47.04),
('Ponto de Coleta RJ - Campos dos Goytacazes 5', 'Rua Principal, 105', 'Campos dos Goytacazes', 'RJ', '10005-005', -15.05, -47.05),
('Ponto de Coleta RJ - Volta Redonda 6', 'Rua Principal, 106', 'Volta Redonda', 'RJ', '10006-006', -15.06, -47.06),
('Ponto de Coleta RJ - Petrópolis 7', 'Rua Principal, 107', 'Petrópolis', 'RJ', '10007-007', -15.07, -47.07),
('Ponto de Coleta RJ - Macaé 8', 'Rua Principal, 108', 'Macaé', 'RJ', '10008-008', -15.08, -47.08),
('Ponto de Coleta RJ - Cabo Frio 9', 'Rua Principal, 109', 'Cabo Frio', 'RJ', '10009-009', -15.09, -47.09),
('Ponto de Coleta RJ - Angra dos Reis 10', 'Rua Principal, 110', 'Angra dos Reis', 'RJ', '10010-010', -15.1, -47.1),
('Ponto de Coleta MG - Belo Horizonte 1', 'Rua Principal, 101', 'Belo Horizonte', 'MG', '10001-001', -15.01, -47.01),
('Ponto de Coleta MG - Uberlândia 2', 'Rua Principal, 102', 'Uberlândia', 'MG', '10002-002', -15.02, -47.02),
('Ponto de Coleta MG - Contagem 3', 'Rua Principal, 103', 'Contagem', 'MG', '10003-003', -15.03, -47.03),
('Ponto de Coleta MG - Juiz de Fora 4', 'Rua Principal, 104', 'Juiz de Fora', 'MG', '10004-004', -15.04, -47.04),
('Ponto de Coleta MG - Betim 5', 'Rua Principal, 105', 'Betim', 'MG', '10005-005', -15.05, -47.05),
('Ponto de Coleta MG - Montes Claros 6', 'Rua Principal, 106', 'Montes Claros', 'MG', '10006-006', -15.06, -47.06),
('Ponto de Coleta MG - Uberaba 7', 'Rua Principal, 107', 'Uberaba', 'MG', '10007-007', -15.07, -47.07),
('Ponto de Coleta MG - Ipatinga 8', 'Rua Principal, 108', 'Ipatinga', 'MG', '10008-008', -15.08, -47.08),
('Ponto de Coleta MG - Governador Valadares 9', 'Rua Principal, 109', 'Governador Valadares', 'MG', '10009-009', -15.09, -47.09),
('Ponto de Coleta MG - Divinópolis 10', 'Rua Principal, 110', 'Divinópolis', 'MG', '10010-010', -15.1, -47.1),
('Ponto de Coleta RS - Porto Alegre 1', 'Rua Principal, 101', 'Porto Alegre', 'RS', '10001-001', -15.01, -47.01),
('Ponto de Coleta RS - Caxias do Sul 2', 'Rua Principal, 102', 'Caxias do Sul', 'RS', '10002-002', -15.02, -47.02),
('Ponto de Coleta RS - Pelotas 3', 'Rua Principal, 103', 'Pelotas', 'RS', '10003-003', -15.03, -47.03),
('Ponto de Coleta RS - Canoas 4', 'Rua Principal, 104', 'Canoas', 'RS', '10004-004', -15.04, -47.04),
('Ponto de Coleta RS - Santa Maria 5', 'Rua Principal, 105', 'Santa Maria', 'RS', '10005-005', -15.05, -47.05),
('Ponto de Coleta RS - Gravataí 6', 'Rua Principal, 106', 'Gravataí', 'RS', '10006-006', -15.06, -47.06),
('Ponto de Coleta RS - Novo Hamburgo 7', 'Rua Principal, 107', 'Novo Hamburgo', 'RS', '10007-007', -15.07, -47.07),
('Ponto de Coleta RS - São Leopoldo 8', 'Rua Principal, 108', 'São Leopoldo', 'RS', '10008-008', -15.08, -47.08),
('Ponto de Coleta RS - Rio Grande 9', 'Rua Principal, 109', 'Rio Grande', 'RS', '10009-009', -15.09, -47.09),
('Ponto de Coleta RS - Passo Fundo 10', 'Rua Principal, 110', 'Passo Fundo', 'RS', '10010-010', -15.1, -47.1),
('Ponto de Coleta BA - Salvador 1', 'Rua Principal, 101', 'Salvador', 'BA', '10001-001', -15.01, -47.01),
('Ponto de Coleta BA - Feira de Santana 2', 'Rua Principal, 102', 'Feira de Santana', 'BA', '10002-002', -15.02, -47.02),
('Ponto de Coleta BA - Vitória da Conquista 3', 'Rua Principal, 103', 'Vitória da Conquista', 'BA', '10003-003', -15.03, -47.03),
('Ponto de Coleta BA - Camaçari 4', 'Rua Principal, 104', 'Camaçari', 'BA', '10004-004', -15.04, -47.04),
('Ponto de Coleta BA - Itabuna 5', 'Rua Principal, 105', 'Itabuna', 'BA', '10005-005', -15.05, -47.05),
('Ponto de Coleta BA - Juazeiro 6', 'Rua Principal, 106', 'Juazeiro', 'BA', '10006-006', -15.06, -47.06),
('Ponto de Coleta BA - Ilhéus 7', 'Rua Principal, 107', 'Ilhéus', 'BA', '10007-007', -15.07, -47.07),
('Ponto de Coleta BA - Jequié 8', 'Rua Principal, 108', 'Jequié', 'BA', '10008-008', -15.08, -47.08),
('Ponto de Coleta BA - Teixeira de Freitas 9', 'Rua Principal, 109', 'Teixeira de Freitas', 'BA', '10009-009', -15.09, -47.09),
('Ponto de Coleta BA - Alagoinhas 10', 'Rua Principal, 110', 'Alagoinhas', 'BA', '10010-010', -15.1, -47.1);
GO
