using RecyclingBackend.Data;
using RecyclingBackend.Models;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace RecyclingBackend.Services
{
    public class UserService
    {
        private readonly RecyclingDbContext _context;

        public UserService(RecyclingDbContext context)
        {
            _context = context;
        }

        public User Register(string username, string email, string password)
        {
            if (_context.Users.Any(u => u.Username == username))
                return null; // Usuário já existe

            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = HashPassword(password),
                Points = 0
            };

            _context.Users.Add(user);
            _context.SaveChanges();
            return user;
        }

        public User Login(string Username, string password)
        {
            var hash = HashPassword(password);
            return _context.Users.FirstOrDefault(u => u.Username == Username && u.PasswordHash == hash);
        }

        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
