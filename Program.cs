var builder = WebApplication.CreateBuilder(args);

// 👇 PRIMA COSA: aggiungi gli user-secrets
builder.Configuration.AddUserSecrets<Program>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Sessione semplice (HTTP funziona con Lax)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(12);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax; // 👈 IMPORTANTE
    options.Cookie.SecurePolicy = CookieSecurePolicy.None; // 👈 HTTP
});

// CORS per React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

// ❌ niente HTTPS
// app.UseHttpsRedirection();

app.UseCors("AllowReact");
app.UseSession();

app.MapControllers();

app.Run();
