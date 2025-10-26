using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecyclingBackend.Data;
using RecyclingBackend.DTOs;
using RecyclingBackend.Models;
using System.Security.Claims;

namespace RecyclingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecyclingController : ControllerBase
    {
        private readonly RecyclingDbContext _db;
        public RecyclingController(RecyclingDbContext db)
        {
            _db = db;
        }


        [HttpPost("add")]
        public async Task<IActionResult> AddEvent(RecyclingEventDto dto)
        {
            var userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                ?? "0"
            );

            var user = await _db.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            // Pontos = número de itens ou quantidade reciclada

            var points = dto.Quantity;

            var ev = new RecyclingEvent
            {
                UserId = userId,
                Points = dto.Quantity,
                Material = dto.Material,
                Quantity = dto.Quantity,
                CreatedAt = DateTime.Now
            };

            _db.RecyclingEvents.Add(ev);

            user.Points += points;

            await _db.SaveChangesAsync();

            // Texto da publicação
            var publicationText = $"{user.Username} reciclou {dto.Quantity}g de {dto.Material}.";

            return Ok(new
            {
                message = "Reciclagem registrada com sucesso!",
                userPoints = user.Points,
                publication = new
                {
                    username = user.Username,
                    text = publicationText,
                    createdAt = ev.CreatedAt
                }
            });
        }


        [AllowAnonymous]
        [HttpGet("ranking")]
        public async Task<IActionResult> Ranking([FromQuery] int top = 5)
        {
            var topUsers = await _db.Users
                .OrderByDescending(u => u.Points)
                .Take(top)
                .Select(u => new { u.Id, u.Username, u.Points })
                .ToListAsync();

            return Ok(topUsers);
        }

       
        [HttpGet("myevents")]
        public async Task<IActionResult> MyEvents()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? "0");
            var events = await _db.RecyclingEvents.Where(e => e.UserId == userId).OrderByDescending(e => e.CreatedAt).ToListAsync();
            return Ok(events);
        }
    }
}
