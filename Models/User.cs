using System.ComponentModel.DataAnnotations;

namespace RecyclingBackend.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;
        [Required]
        public string? Email { get; set; } = null!;

        public int Points { get; set; } = 0;
    }
}
