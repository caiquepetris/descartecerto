using System.ComponentModel.DataAnnotations;

namespace RecyclingBackend.Models
{
    public class CollectionPoint
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        public string? Address { get; set; }

        // CEP (Brazilian postal code) — stored normalized (only digits)
        public string? Cep { get; set; }

        // Latitude / Longitude in decimal degrees
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public string? City { get; set; }
        public string? State { get; set; }
    }
}
