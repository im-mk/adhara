using App.Api.Options;

namespace App.Api.Tests.Options;

public class DownstreamServicesOptionsTests
{
    [Fact]
    public void Constructor_NoOverrides_UsesDefaultValues()
    {
        // Arrange & Act
        var options = new DownstreamServicesOptions();

        // Assert
        Assert.Equal("http://localhost:8080", options.OrderServiceBaseUrl);
        Assert.Equal("http://localhost:8040", options.UserServiceBaseUrl);
    }

    [Fact]
    public void OrderServiceBaseUrl_CustomValue_ReturnsAssignedValue()
    {
        // Arrange
        var options = new DownstreamServicesOptions();

        // Act
        options.OrderServiceBaseUrl = "https://order-service.example.com";

        // Assert
        Assert.Equal("https://order-service.example.com", options.OrderServiceBaseUrl);
    }

    [Fact]
    public void UserServiceBaseUrl_CustomValue_ReturnsAssignedValue()
    {
        // Arrange
        var options = new DownstreamServicesOptions();

        // Act
        options.UserServiceBaseUrl = "https://user-service.example.com";

        // Assert
        Assert.Equal("https://user-service.example.com", options.UserServiceBaseUrl);
    }

    [Fact]
    public void SectionName_ClassDefinition_MatchesExpectedValue()
    {
        // Assert
        Assert.Equal("DownstreamServices", DownstreamServicesOptions.SectionName);
    }

    [Fact]
    public void BaseUrls_CustomValues_ReturnAssignedValues()
    {
        // Arrange
        var options = new DownstreamServicesOptions
        {
            OrderServiceBaseUrl = "https://order-api.prod.com",
            UserServiceBaseUrl = "https://user-api.prod.com"
        };

        // Act & Assert
        Assert.Equal("https://order-api.prod.com", options.OrderServiceBaseUrl);
        Assert.Equal("https://user-api.prod.com", options.UserServiceBaseUrl);
    }
}
