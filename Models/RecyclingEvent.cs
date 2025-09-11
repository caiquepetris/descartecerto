using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecyclingBackend.Models
{
    public class RecyclingEvent
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }

        // number of items recycled in this event
        public int Items { get; set; }

        // points awarded for this event (can be equal to Items)
        public int Points { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
