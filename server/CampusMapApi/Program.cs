// sets yo the seb server, enables HTTPS, configures services, and starts handling incoming requests

using CampusMapApi;



// creates new instance of the web application (loads configs from appsettings.json)
var builder = WebApplication.CreateBuilder(args);

// sets default port to 5159 and server will listen on all available network interfaces
var port = Environment.GetEnvironmentVariable("PORT") ?? "5159";
var urls = $"https://0.0.0.0:{port}";

// configure Kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port), listenOptions =>
    {
        listenOptions.UseHttps("certs/cert.pfx", "BlooMap");
    });
});
builder.WebHost.UseUrls(urls); // set url

builder.Services.AddControllers(); // registers MVC controllers
builder.Services.AddOpenApi(); // enable OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Console.WriteLine("Running TestQuery...");
// await TestQuery.QueryTest(); // This will execute the test query

// add support for calling api endpoints from brower
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// finalize app configurations
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection(); // redirect http requests to https
app.UseCors("AllowAllOrigins"); // allow javascript to call api from browswer
app.UseAuthorization();
app.MapControllers(); // tell ASP.NET Core to use controller-based routes
app.Run(); // start web server and begin listening for requests
