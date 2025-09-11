namespace RecyclingBackend.DTOs
{
    public record RegisterDto(string Username, string Password, string? Email);
    public record LoginDto(string Username, string Password);
    public record AuthResponseDto(string Token, int UserId, string Username, int Points);
    public record RecyclingEventDto(int Items);
    public record CollectionPointDto(string Name, string? Address, string? Cep, double? Latitude, double? Longitude, string? City, string? State);
}
