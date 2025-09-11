using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace RecyclingBackend.Services
{
    public interface IGeoService
    {
        // Try to fetch latitude/longitude from a Brazilian CEP (via public APIs).
        Task<(double? lat, double? lon, string? city, string? state)> GetLatLonFromCepAsync(string cep);
    }

    public class GeoService : IGeoService
    {
        private readonly HttpClient _http = new HttpClient();

        // Uses ViaCEP to get address, then Nominatim to geocode.
        public async Task<(double? lat, double? lon, string? city, string? state)> GetLatLonFromCepAsync(string cep)
        {
            if (string.IsNullOrWhiteSpace(cep)) return (null, null, null, null);
            var onlyDigits = new string(cep.Where(char.IsDigit).ToArray());
            if (onlyDigits.Length != 8) return (null, null, null, null);

            // ViaCEP for address
            var viaCep = await _http.GetAsync($"https://viacep.com.br/ws/{onlyDigits}/json/");
            if (!viaCep.IsSuccessStatusCode) return (null, null, null, null);
            var viaCepJson = JObject.Parse(await viaCep.Content.ReadAsStringAsync());
            var city = viaCepJson.Value<string>("localidade");
            var state = viaCepJson.Value<string>("uf");
            var street = viaCepJson.Value<string>("logradouro");
            var neighborhood = viaCepJson.Value<string>("bairro");

            var queryAddress = string.Join(", ", new[] { street, neighborhood, city, state }.Where(s => !string.IsNullOrWhiteSpace(s)));
            if (string.IsNullOrWhiteSpace(queryAddress)) queryAddress = onlyDigits;

            // Nominatim geocoding
            var nominatimUrl = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(queryAddress)}&format=json&addressdetails=1&limit=1";
            var nom = await _http.GetAsync(nominatimUrl);
            if (!nom.IsSuccessStatusCode) return (null, null, city, state);
            var nomJson = JArray.Parse(await nom.Content.ReadAsStringAsync());
            if (!nomJson.Any()) return (null, null, city, state);
            var first = nomJson[0];
            double lat = double.Parse(first.Value<string>("lat") ?? "0", System.Globalization.CultureInfo.InvariantCulture);
            double lon = double.Parse(first.Value<string>("lon") ?? "0", System.Globalization.CultureInfo.InvariantCulture);

            return (lat, lon, city, state);
        }
    }
}
