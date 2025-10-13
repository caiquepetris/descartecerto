namespace RecyclingBackend.Models
{
    public class UserRegisterRequest
    {
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }  // senha em texto
    }
}
