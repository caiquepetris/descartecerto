# Recycling Backend - ASP.NET Core Web API
## Overview
Projeto backend em C# (.NET 7) para o site de reciclagem. Contém:
- Registro e login (JWT).
- Registro de eventos de reciclagem (cada item = 1 ponto).
- Ranking de usuários por pontos.
- Cadastro e busca de pontos de coleta por CEP (usa ViaCEP + Nominatim para geocoding).

## Como usar
1. Abra a solução no Visual Studio (arquivo .csproj presente).
2. Atualize `appsettings.json` -> `Jwt:Key` para uma chave forte.
3. Ajuste a connection string se desejar usar um SQL Server diferente (nova base será criada automaticamente).
4. Restaure pacotes NuGet e rode a API.
5. Endpoints principais:
   - POST /api/auth/register  { username, password, email? }
   - POST /api/auth/login     { username, password }
   - POST /api/recycling/add  (auth) { items }
   - GET  /api/recycling/ranking
   - POST /api/collectionpoints/create  { name, address?, cep?, latitude?, longitude? }
   - GET  /api/collectionpoints/nearest?cep=01001000

## Observações
- A geocodificação usa serviços públicos (ViaCEP e Nominatim). Tome cuidado com quotas.
- Para produção, habilite HTTPS, valide tokens com issuer/audience, e proteja a chave JWT.


-- Project prepared for SQL Server; init script and CSV seed added.
