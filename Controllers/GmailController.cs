using System.Text;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using Google.Apis.Services;
using Microsoft.AspNetCore.Mvc;

namespace GmailBackend.Controllers
{
    [ApiController]
    [Route("api/gmail")]
    public class GmailController : ControllerBase
    {
        private readonly IConfiguration _config;
        private const string SessionRefreshTokenKey = "gmail_modify_refreshToken";

        public GmailController(IConfiguration config)
        {
            _config = config;
        }

        private GmailService? CreateGmailServiceFromSession()
        {
            var refreshToken = HttpContext.Session.GetString(SessionRefreshTokenKey);
            if (refreshToken == null)
                return null;

            var clientId = _config["GoogleAuth:ClientId"];
            var clientSecret = _config["GoogleAuth:ClientSecret"];

            var flow = new GoogleAuthorizationCodeFlow(
                new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = clientId,
                        ClientSecret = clientSecret
                    },
                    Scopes = new[] { "https://www.googleapis.com/auth/gmail.modify" }
                }
            );

            var credential = new UserCredential(flow, "user", new TokenResponse
            {
                RefreshToken = refreshToken
            });

            var service = new GmailService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "DashboardApp"
            });

            return service;
        }

        // Decode Base64 URL-safe
        private static string DecodeBase64Url(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            var fixedInput = input.Replace('-', '+').Replace('_', '/');

            switch (fixedInput.Length % 4)
            {
                case 2: fixedInput += "=="; break;
                case 3: fixedInput += "="; break;
            }

            var bytes = Convert.FromBase64String(fixedInput);
            return Encoding.UTF8.GetString(bytes);
        }

        // Estrae il testo dal payload MIME
        private static string GetBodyText(MessagePart? part)
        {
            if (part == null)
                return string.Empty;

            if (part.Parts == null || part.Parts.Count == 0)
            {
                if (!string.IsNullOrEmpty(part.Body?.Data))
                {
                    return DecodeBase64Url(part.Body.Data);
                }
                return string.Empty;
            }

            var textPart = part.Parts.FirstOrDefault(p =>
                p.MimeType != null && p.MimeType.StartsWith("text/plain", StringComparison.OrdinalIgnoreCase));

            if (textPart != null)
                return GetBodyText(textPart);

            var htmlPart = part.Parts.FirstOrDefault(p =>
                p.MimeType != null && p.MimeType.StartsWith("text/html", StringComparison.OrdinalIgnoreCase));

            if (htmlPart != null)
                return GetBodyText(htmlPart);

            foreach (var p in part.Parts)
            {
                var result = GetBodyText(p);
                if (!string.IsNullOrEmpty(result))
                    return result;
            }

            return string.Empty;
        }

        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages()
        {
            var service = CreateGmailServiceFromSession();
            if (service == null)
                return Unauthorized(new { error = "Not authenticated" });

            var listReq = service.Users.Messages.List("me");
            listReq.MaxResults = 10;
            listReq.LabelIds = new[] { "INBOX" };

            var list = await listReq.ExecuteAsync();
            var messages = new List<object>();

            if (list.Messages != null)
            {
                foreach (var msg in list.Messages)
                {
                    var email = await service.Users.Messages.Get("me", msg.Id).ExecuteAsync();
                    var headers = email.Payload.Headers;

                    string from = headers.FirstOrDefault(h => h.Name == "From")?.Value ?? "";
                    string subject = headers.FirstOrDefault(h => h.Name == "Subject")?.Value ?? "";
                    string date = headers.FirstOrDefault(h => h.Name == "Date")?.Value ?? "";

                    messages.Add(new
                    {
                        id = msg.Id,
                        from,
                        subject,
                        date,
                        snippet = email.Snippet
                    });
                }
            }

            return Ok(messages);
        }

        [HttpGet("messages/{id}")]
        public async Task<IActionResult> GetMessage(string id)
        {
            var service = CreateGmailServiceFromSession();
            if (service == null)
                return Unauthorized(new { error = "Not authenticated" });

            var email = await service.Users.Messages.Get("me", id).ExecuteAsync();
            var headers = email.Payload.Headers;

            string from = headers.FirstOrDefault(h => h.Name == "From")?.Value ?? "";
            string subject = headers.FirstOrDefault(h => h.Name == "Subject")?.Value ?? "";
            string date = headers.FirstOrDefault(h => h.Name == "Date")?.Value ?? "";

            string body = GetBodyText(email.Payload);

            return Ok(new
            {
                id,
                from,
                subject,
                date,
                body
            });
        }

        [HttpPost("messages/{id}/archive")]
        public async Task<IActionResult> ArchiveMessage(string id)
        {
            var service = CreateGmailServiceFromSession();
            if (service == null)
                return Unauthorized(new { error = "Not authenticated" });

            try
            {
                // giusto per verificare che il messaggio esista
                var msg = await service.Users.Messages.Get("me", id).ExecuteAsync();

                var modifyRequest = new ModifyMessageRequest
                {
                    RemoveLabelIds = new[] { "INBOX" },
                    AddLabelIds = Array.Empty<string>()
                };

                await service.Users.Messages.Modify(modifyRequest, "me", id).ExecuteAsync();

                return Ok(new { success = true });
            }
            catch (Google.GoogleApiException ex)
            {
                // Errore specifico API Google (scope insufficienti, ecc.)
                return StatusCode((int)ex.HttpStatusCode, new
                {
                    error = ex.Message,
                    // Code HTTP più codice logico interno
                    httpCode = (int)ex.HttpStatusCode,
                    apiCode = ex.Error?.Code
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
            }
        }
    }
}
