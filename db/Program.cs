using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Neo4j.Driver;

class Program
{
    private static async Task Main()
    {
        string uri = "neo4j+s://apibloomap.xyz:7687";
        string? user = Environment.GetEnvironmentVariable("DB_USER");
        string? password = Environment.GetEnvironmentVariable("DB_PASSWORD");

        if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(password))
        {
            throw new Exception("DB_USER and DB_PASSWORD environment variables must be set.");
        }

        IDriver driver = GraphDatabase.Driver(uri, AuthTokens.Basic(user, password));
        await using var session = driver.AsyncSession();

        try
        {
            await ClearDatabase(session);
            var nodes = ReadNodes("csvs/nodes.csv");
            var edges = ReadEdges("csvs/edges.csv");
            await InsertNodes(session, nodes);
            await InsertEdges(session, edges);
            Console.WriteLine("Database population complete.");
        }
        finally
        {
            await driver.DisposeAsync();
        }
    }

    private static async Task ClearDatabase(IAsyncSession session)
    {
        await session.RunAsync("MATCH (n:Location) DETACH DELETE n");
        Console.WriteLine("Existing nodes deleted.");
    }

    private static List<Dictionary<string, object>> ReadNodes(string filePath)
    {
        var lines = File.ReadAllLines(filePath);
        return lines.Skip(1).Select(line =>
        {
            var parts = line.Split(',');
            return new Dictionary<string, object>
            {
                ["id"] = int.Parse(parts[0]),
                ["locationCode"] = parts[1],
                ["floor"] = double.TryParse(parts[2], out double f) ? f : 0,
                ["building"] = parts[3],
                ["name"] = parts[4],
                ["isValidDestination"] = bool.TryParse(parts[5], out bool b) && b
            };
        }).ToList();
    }

    private static List<Dictionary<string, object>> ReadEdges(string filePath)
    {
        var lines = File.ReadAllLines(filePath);
        return lines.Skip(1).Select(line =>
        {
            var parts = line.Split(',');
            return new Dictionary<string, object>
            {
                ["startId"] = int.Parse(parts[0]),
                ["endId"] = int.Parse(parts[1]),
                ["distance"] = double.Parse(parts[2])
            };
        }).ToList();
    }

    private static async Task InsertNodes(IAsyncSession session, List<Dictionary<string, object>> nodes)
    {
        foreach (var node in nodes)
        {
            await session.RunAsync("CREATE (:Location {id: $id, locationCode: $locationCode, floor: $floor, building: $building, name: $name, isValidDestination: $isValidDestination})", node);
        }
        Console.WriteLine("Nodes inserted.");
    }

    private static async Task InsertEdges(IAsyncSession session, List<Dictionary<string, object>> edges)
    {
        foreach (var edge in edges)
        {
            await session.RunAsync("MATCH (a:Location {id: $startId}), (b:Location {id: $endId}) CREATE (a)-[:CONNECTED_TO {distance: $distance}]->(b), (b)-[:CONNECTED_TO {distance: $distance}]->(a)", edge);
        }
        Console.WriteLine("Edges inserted.");
    }
}
