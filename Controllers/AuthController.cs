using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecyclingBackend.DTOs;
using RecyclingBackend.Models;
using RecyclingBackend.Services;
using System.Security.Claims;

namespace RecyclingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IJwtService _jwtService;

        public AuthController(UserService userService, IJwtService jwtService)
        {
            _userService = userService;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegisterRequest request)
        {
            var createdUser = _userService.Register(request.Username, request.Email, request.Password);
            if (createdUser == null)
                return BadRequest("Usuário não pôde ser criado.");

            return Ok(new
            {
                createdUser.Id,
                createdUser.Username,
                createdUser.Email
            });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginRequest request)
        {
            var loggedUser = _userService.Login(request.Email, request.Password);

            if (loggedUser == null)
                return Unauthorized("Usuário ou senha inválidos.");


            var token = _jwtService.GenerateToken(loggedUser);

            var response = new AuthResponseDto(
                token,
                loggedUser.Id,
                loggedUser.Username,
                loggedUser.Email,
                loggedUser.Points
            );

            return Ok(response);
        }



    }
}
