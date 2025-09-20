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

GO
