namespace RecyclingBackend.DTOs
{
    public record RegisterDto(string Username, string Password, string? Email);
    public record LoginDto(string Username,string Email, string Password);
    public record AuthResponseDto(string Token, int UserId, string Username, string Email, int Points);
    public record RecyclingEventDto(int Items);
}
