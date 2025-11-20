using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GmailBackend.Controllers
{
    [ApiController]
    [Route("api/gmail/auth")]
    public class GmailAuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private const string SessionRefreshTokenKey = "gmail_modify_refreshToken";

        public GmailAuthController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet("start")]
        public IActionResult Start()
        {
            var clientId = _config["GoogleAuth:ClientId"];
            var redirectUri = _config["GoogleAuth:RedirectUri"];

            var url =
                "https://accounts.google.com/o/oauth2/v2/auth" +
                "?response_type=code" +
                "&access_type=offline" +
                "&prompt=consent" +   // forza di nuovo la schermata di consenso
                "&scope=https://www.googleapis.com/auth/gmail.modify" +
                $"&client_id={clientId}" +
                $"&redirect_uri={redirectUri}";

            return Redirect(url);
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code)
        {
            var flow = new GoogleAuthorizationCodeFlow(
                new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = _config["GoogleAuth:ClientId"],
                        ClientSecret = _config["GoogleAuth:ClientSecret"]
                    },
                    Scopes = new[] { "https://www.googleapis.com/auth/gmail.modify" }
                });

            var token = await flow.ExchangeCodeForTokenAsync(
                "user",
                code,
                _config["GoogleAuth:RedirectUri"],
                CancellationToken.None
            );

            // 🔥 usiamo una chiave NUOVA per questo token con scope "modify"
            if (!string.IsNullOrEmpty(token.RefreshToken))
            {
                HttpContext.Session.SetString(SessionRefreshTokenKey, token.RefreshToken!);
            }

            return Redirect("http://localhost:3000");
        }

        [HttpGet("check-auth")]
        public IActionResult CheckAuth()
        {
            var token = HttpContext.Session.GetString(SessionRefreshTokenKey);
            return Ok(new { authenticated = token != null });
        }

        // opzionale: per svuotare la sessione velocemente
        [HttpGet("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { success = true });
        }
    }
}
