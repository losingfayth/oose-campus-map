// BI: Database-related code is most likely going to need to be integrated into
// the CampusMapApi project instead of being its own project here.
// For now, it remains here as a proof of concept.

using Neo4j.Driver;

class Program {
    private static IDriver _driver;

// BI: Initialize the database driver with your login credentials.
// Note: we are using community edition Neo4j, so everyone is an admin.
// BE CAREFUL!
    static Program()
    {
        var uri = "neo4j+s://apibloomap.xyz:7687";
        var username = Environment.GetEnvironmentVariable("DB_USER") 
            ?? throw new InvalidOperationException("DB_USER is not set");
        var password = Environment.GetEnvironmentVariable("DB_PASSWORD") 
            ?? throw new InvalidOperationException("DB_PASSWORD is not set");

        _driver = GraphDatabase.Driver(uri, 
            AuthTokens.Basic(username, password));
    }

    static async Task Main(string[] args) {

        try
        {
            // BI: Proof of concept connecting to the database.
            await _driver.VerifyConnectivityAsync();
            Console.WriteLine("Connected to db (enter to continue)");
            Console.ReadLine();

            // BI: Proof of concept creating and querying nodes.
            Console.WriteLine("Creating nodes...");
            await CreateNodes();
            await QueryNodes();
            Console.WriteLine("(enter to continue)");
            Console.ReadLine();

            // TODO: BI: Proof of concept create relationships between nodes.
            Console.WriteLine("Creating edges...");
            await CreateEdges();
            await QueryNodes();
            Console.WriteLine("(enter to continue)");
            Console.ReadLine();

            // BI: Proof of concept path traversal.
            Console.WriteLine("Finding Path from 103 to 115...");
            await FindPath();
            Console.WriteLine("(enter to continue)");
            Console.ReadLine();

            // BI: Proof of concept deleting nodes.
            Console.WriteLine("Deleting Nodes...");
            await DeleteNodes();
            await QueryNodes();
            Console.WriteLine("(enter to continue)");
            Console.ReadLine();
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
        finally
        {
            await _driver.DisposeAsync();
        }
    }

    static async Task CreateNodes()
    {
        await using var session = _driver.AsyncSession();

        var rooms = new List<Dictionary<string, object>>
        {
            new() { { "building", "Ben Franklin Hall" }, { "room", "103" }, { "floor", "1" }, { "lat", 123 }, { "lon", 234 } },
            new() { { "building", "Ben Franklin Hall" }, { "room", "113" }, { "floor", "1" }, { "lat", 124 }, { "lon", 235 } },
            new() { { "building", "Ben Franklin Hall" }, { "room", "115" }, { "floor", "1" }, { "lat", 125 }, { "lon", 236 } }
        };

        var hallways = new List<Dictionary<string, object>>
        {
            new() { { "building", "Ben Franklin Hall" }, { "floor", "1" }, { "lat", 126 }, { "lon", 127 } },
            new() { { "building", "Ben Franklin Hall" }, { "floor", "1" }, { "lat", 127 }, { "lon", 128 } },
            new() { { "building", "Ben Franklin Hall" }, { "floor", "1" }, { "lat", 128 }, { "lon", 129 } }
        };

        await session.ExecuteWriteAsync(async tx =>
        {
            foreach (var room in rooms)
            {
                var query = @"
                    CREATE (r:Room { 
                        building: $building, 
                        roomNumber: $room, 
                        floor: $floor, 
                        latitude: $lat, 
                        longitude: $lon 
                    }) RETURN r";
                
                var cursor = await tx.RunAsync(query, room);
                var record = await cursor.SingleAsync();
            }

            foreach (var hallway in hallways)
            {
                var query = @"
                    CREATE (h:Hallway { 
                        building: $building, 
                        floor: $floor, 
                        latitude: $lat, 
                        longitude: $lon 
                    }) RETURN h";

                var cursor = await tx.RunAsync(query, hallway);
                var record = await cursor.SingleAsync();
            }
        });
    }

    static async Task QueryNodes()
    {
        await using var session = _driver.AsyncSession();

        await session.ExecuteReadAsync(async tx =>
        {
            var query = @"
            MATCH (n) OPTIONAL MATCH (n)-[r]->(m) 
            RETURN n, r, m";
            var result = await tx.RunAsync(query);

            // BI: Check if query returned nothing
            if (!await result.FetchAsync())
            {
                Console.WriteLine("No nodes or relationships found in the database.");
                return;
            }

            // BI: Iterate through results
            do
            {
                var node = result.Current["n"].As<INode>();
                Console.WriteLine($"Node ID: {node.ElementId}, Labels: {string.Join(", ", node.Labels)}");

                foreach (var (key, value) in node.Properties)
                {
                    Console.WriteLine($"  {key}: {value}");
                }

                // BI: Check if a relationship exists in this record
                if (result.Current["r"] != null)
                {
                    var relationship = result.Current["r"].As<IRelationship>();
                    var relatedNode = result.Current["m"].As<INode>();

                    Console.WriteLine($"  --[{relationship.Type} (ID: {relationship.ElementId})]--> Node ID: {relatedNode.ElementId}, Labels: {string.Join(", ", relatedNode.Labels)}");
                    
                    foreach (var (key, value) in relationship.Properties)
                    {
                        Console.WriteLine($"    Relationship Property: {key}: {value}");
                    }
                }

                Console.WriteLine();
            }
            while (await result.FetchAsync());
        });
    }

    static async Task CreateEdges()
    {
        await using var session = _driver.AsyncSession();

        await session.ExecuteWriteAsync(async tx =>
        {
            // BI: hardcoded hell for demonstration purposes only
            // Also relationships are unidirectional in Neo4j, so I store each
            // relationship forwards and backwards. Possibly unnecessary, I
            // need to learn more
            var query = @"
            MATCH (r103:Room {roomNumber: '103'}), 
              (h1:Hallway), 
              (h2:Hallway), 
              (r113:Room {roomNumber: '113'}), 
              (h3:Hallway), 
              (r115:Room {roomNumber: '115'})
            WHERE h1.latitude = 126 AND h1.longitude = 127
              AND h2.latitude = 127 AND h2.longitude = 128
              AND h3.latitude = 128 AND h3.longitude = 129
            MERGE (r103)-[:DISTANCE {dist: 2}]->(h1)
            MERGE (h1)-[:DISTANCE {dist: 2}]->(r103)
            MERGE (h1)-[:DISTANCE {dist: 1}]->(h2)
            MERGE (h2)-[:DISTANCE {dist: 1}]->(h1)
            MERGE (h2)-[:DISTANCE {dist: 3}]->(r113)
            MERGE (r113)-[:DISTANCE {dist: 3}]->(h2)
            MERGE (h2)-[:DISTANCE {dist: 4}]->(h3)
            MERGE (h3)-[:DISTANCE {dist: 4}]->(h2)
            MERGE (h3)-[:DISTANCE {dist: 5}]->(r115)
            MERGE (r115)-[:DISTANCE {dist: 5}]->(h3)";
        
            await tx.RunAsync(query);
        });
    }

    static async Task FindPath()
    {
        // BI: Unimplemented (requires a Neo4j plugin)
    }

    static async Task DeleteNodes()
    {
        await using var session = _driver.AsyncSession();

        await session.ExecuteWriteAsync(async tx =>
        {
            var query = "MATCH (n) DETACH DELETE n";
            await tx.RunAsync(query);
        });
    }
}