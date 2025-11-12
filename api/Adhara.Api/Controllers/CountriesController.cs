using Microsoft.AspNetCore.Mvc;
using Dapper;
using Adhara.Api.Entities;
using Adhara.Api.Services;

namespace Adhara.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class CountriesController : ControllerBase
{
    private readonly ICountriesService _countriesService;

    public CountriesController(ICountriesService countriesService)
    {
        _countriesService = countriesService;
    }

    [HttpGet]
    [EndpointName("GetAllCountries")]
    public async Task<ActionResult<IEnumerable<Country>>> GetAll()
    {
        var result = await _countriesService.GetAllCountriesAsync();
        return Ok(result);
    }
}
