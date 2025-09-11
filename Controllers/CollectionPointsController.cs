using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecyclingBackend.Data;
using RecyclingBackend.DTOs;
using RecyclingBackend.Models;
using RecyclingBackend.Services;

namespace RecyclingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CollectionPointsController : ControllerBase
    {
        private readonly RecyclingDbContext _db;
        private readonly IGeoService _geo;

        public CollectionPointsController(RecyclingDbContext db, IGeoService geo)
        {
            _db = db;
            _geo = geo;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(CollectionPointDto dto)
        {
            var point = new CollectionPoint
            {
                Name = dto.Name,
                Address = dto.Address,
                Cep = dto.Cep != null ? new string(dto.Cep.Where(char.IsDigit).ToArray()) : null,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                City = dto.City,
                State = dto.State
            };

            // If Cep provided and no lat/lon, try to fetch
            if (!point.Latitude.HasValue && !point.Longitude.HasValue && !string.IsNullOrWhiteSpace(point.Cep))
            {
                var (lat, lon, city, state) = await _geo.GetLatLonFromCepAsync(point.Cep);
                point.Latitude = lat;
                point.Longitude = lon;
                if (!string.IsNullOrWhiteSpace(city)) point.City = city;
                if (!string.IsNullOrWhiteSpace(state)) point.State = state;
            }

            _db.CollectionPoints.Add(point);
            await _db.SaveChangesAsync();
            return Ok(point);
        }

        // Return nearest collection points by CEP lookup
        [HttpGet("nearest")]
        public async Task<IActionResult> Nearest([FromQuery] string cep, [FromQuery] int maxResults = 10, [FromQuery] double maxKm = 200)
        {
            if (string.IsNullOrWhiteSpace(cep)) return BadRequest(new { message = "Cep required" });
            var onlyDigits = new string(cep.Where(char.IsDigit).ToArray());
            if (onlyDigits.Length != 8) return BadRequest(new { message = "Cep must have 8 digits" });

            var (lat, lon, city, state) = await _geo.GetLatLonFromCepAsync(onlyDigits);
            if (!lat.HasValue || !lon.HasValue) return BadRequest(new { message = "Could not geocode CEP" });

            // simple Haversine distance calc in SQL projection is not available without raw SQL; we will fetch candidates with lat/lon and compute distances in-memory
            var candidates = await _db.CollectionPoints.Where(p => p.Latitude.HasValue && p.Longitude.HasValue).ToListAsync();
            var list = candidates.Select(p =>
            {
                var d = HaversineDistance((double)lat, (double)lon, p.Latitude!.Value, p.Longitude!.Value);
                return new { p.Id, p.Name, p.Address, p.Cep, p.City, p.State, p.Latitude, p.Longitude, DistanceKm = d };
            })
            .Where(x => x.DistanceKm <= maxKm)
            .OrderBy(x => x.DistanceKm)
            .Take(maxResults)
            .ToList();

            return Ok(new { origin = new { lat, lon, city, state }, results = list });
        }

        private static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            double R = 6371; // km
            double dLat = ToRad(lat2 - lat1);
            double dLon = ToRad(lon2 - lon1);
            double a = Math.Sin(dLat/2) * Math.Sin(dLat/2) +
                       Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                       Math.Sin(dLon/2) * Math.Sin(dLon/2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1-a));
            return R * c;
        }
        private static double ToRad(double deg) => deg * (Math.PI/180);
    }
}
