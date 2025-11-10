using System.ComponentModel.DataAnnotations;

namespace Adhara.Api.Models;

public class CreateCustomerRequest
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = default!;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = default!;

    [Required]
    public AddressRequest BillingAddress { get; set; } = default!;

    [Required]
    public AddressRequest ShippingAddress { get; set; } = default!;
}

public class UpdateCustomerRequest
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = default!;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = default!;
}

public class AddressRequest
{
    [Required]
    [StringLength(255)]
    public string AddressLine1 { get; set; } = default!;

    [StringLength(255)]
    public string? AddressLine2 { get; set; }

    [StringLength(255)]
    public string? AddressLine3 { get; set; }

    [StringLength(255)]
    public string? AddressLine4 { get; set; }

    [Required]
    [StringLength(10)]
    public string Postcode { get; set; } = default!;

    [Required]
    [StringLength(2)]
    public string Country { get; set; } = "GB";
}


