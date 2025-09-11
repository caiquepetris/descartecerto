using Microsoft.AspNetCore.Mvc;
using RecyclingBackend.Models;
using RecyclingBackend.Services;

namespace RecyclingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;

        public AuthController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegisterRequest request)
        {
            var createdUser = _userService.Register(request.Username, request.Email, request.Password);
            if (createdUser == null)
                return BadRequest("Usuário já existe.");

            return Ok(new { createdUser.Id, createdUser.Username, createdUser.Email });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginRequest request)
        {
            var loggedUser = _userService.Login(request.Username, request.Password);
            if (loggedUser == null)
                return Unauthorized("Usuário ou senha inválidos.");

            return Ok(new { loggedUser.Id, loggedUser.Username, loggedUser.Email, loggedUser.Points });
        }
    }
}
