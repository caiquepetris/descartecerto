using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.StaticFiles;
using RecyclingBackend.Data;
using RecyclingBackend.Services;
using Microsoft.OpenApi.Models; // <- necessrio para Swagger
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// load configuration
var configuration = builder.Configuration;

// Add services
builder.Services.AddScoped<UserService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Recycling API", Version = "v1" });
});

builder.Services.AddDbContext<RecyclingDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IJwtService, JwtService>();


// Authentication - JWT
var jwtKey = configuration["Jwt:Key"];
var keyBytes = Encoding.UTF8.GetBytes(jwtKey ?? "change_this_to_a_long_secret_key");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateLifetime = true
    };
});

var app = builder.Build();

// Initialize/ensure DB
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RecyclingDbContext>();
    db.Database.EnsureCreated();
}

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Recycling API V1");
    });
}

var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".html"] = "text/html; charset=utf-8";
provider.Mappings[".js"] = "application/javascript; charset=utf-8";
provider.Mappings[".css"] = "text/css; charset=utf-8";

app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider

});


app.UseDefaultFiles(); // Serve index.html automaticamente
app.UseStaticFiles();  // Permite servir CSS, JS, imagens

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
