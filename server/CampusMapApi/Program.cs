/**
Sets up the web server, enables HTTPS, configures services, and enables controller to begin handling incoming API endpoint requests
*/ 
using CampusMapApi;
using CampusMapApi.Services;
using CampusMapApi.Utilities;

// creates new instance of the web application (loads configs from appsettings.json)
var builder = WebApplication.CreateBuilder(args);

// sets default port to 5159 and server will listen on all available network interfaces
var port = Environment.GetEnvironmentVariable("PORT") ?? "5163";
var urls = $"https://0.0.0.0:{port}";

// configure Kestrel
builder.WebHost.ConfigureKestrel(options => {
    options.ListenAnyIP(int.Parse(port), listenOptions => {
        listenOptions.UseHttps("certs/cert.pfx", "BlooMap");
    });
});
builder.WebHost.UseUrls(urls); // set url

builder.Services.AddControllers(); // registers MVC controllers
builder.Services.AddOpenApi(); // enable OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// add support for calling api endpoints from brower
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAllOrigins",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

builder.Services.AddSingleton<Neo4jService>(provider =>
    new Neo4jService(
        builder.Configuration["neo4j+s://apibloomap.xyz:7687"],
        builder.Configuration[Environment.GetEnvironmentVariable("DB_USER")],
        builder.Configuration[Environment.GetEnvironmentVariable("DB_PASSWORD") ]
    )
);

// finalize app configurations
var app = builder.Build();
Neo4jServiceLocator.Services = app.Services;

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseCors("AllowAllOrigins"); // allow javascript to call api from browswer
app.UseHttpsRedirection(); // redirect http requests to https
app.UseAuthorization();
app.MapControllers(); // tell ASP.NET Core to use controller-based routes
app.Run(); // start web server and begin listening for requests