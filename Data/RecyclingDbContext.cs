using Microsoft.EntityFrameworkCore;
using RecyclingBackend.Models;

namespace RecyclingBackend.Data
{
    public class RecyclingDbContext : DbContext
    {
        public RecyclingDbContext(DbContextOptions<RecyclingDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<RecyclingEvent> RecyclingEvents { get; set; }
        public DbSet<CollectionPoint> CollectionPoints { get; set; }
    }
}

