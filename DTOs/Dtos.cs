namespace RecyclingBackend.DTOs
{
    public record RegisterDto(string Username, string Password, string? Email);
    public record LoginDto(string Username,string Email, string Password);
    public record AuthResponseDto(string Token, int UserId, string Username, string Email, int Points);
    public class RecyclingEventDto { public string Material { get; set; } = string.Empty; public int Quantity { get; set; } }
}
