using System.Threading.Tasks;
using Neo4j.Driver;
namespace CampusMapApi {

  public class TestQuery {

    private static IDriver _driver;
    public static async Task QueryTest() {

      // initial db connection
      var uri = "neo4j+s://apibloomap.xyz:7687";
      var username = Environment.GetEnvironmentVariable("DB_USER") 
        ?? throw new InvalidOperationException("DB_USER is not set");
      var password = Environment.GetEnvironmentVariable("DB_PASSWORD") 
        ?? throw new InvalidOperationException("DB_PASSWORD is not set");
        
      _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
      await using var session = _driver.AsyncSession();

      // inserting test nodes
      // Console.WriteLine("Inserting nodes...");
      // await CreateNodes();

      // query to retrieve all nodes building and room number attributes
      var query = "MATCH (n) RETURN n.building AS building, n.roomNumber AS roomNumber";

      var locations = new List<LocationNode>();
      
      try {
            
        var result = await session.RunAsync(query);

        // Process each record in the result set
        await result.ForEachAsync(record => {

          string building = record["building"].As<string>();
          string roomNumber = record["roomNumber"].As<string>();

          string formattedRoom = $"{building} Room {roomNumber}";

          LocationNode node = new LocationNode();
          node.building = building;
          node.roomNumber = roomNumber;
          node.displayName = formattedRoom;
          locations.Add(node);

        });

      } catch (Exception ex) {
          Console.WriteLine($"Error: {ex.Message}");
      }

      //List<LocationNode> list = await Test();

      // print query results
      foreach (var node in locations) {
        Console.WriteLine("Printing DB...");
        Console.WriteLine($"{node.building}, {node.roomNumber}, {node.displayName}");
      }

      // delete test nodes
      // Console.WriteLine("Deleting nodes...");
      // await DeleteNodes();
    }

    /*
    * DANGEROUS QUERY! THIS WILL NUKE THE DATABASE
    */
    static async Task DeleteNodes()
    {
        await using var session = _driver.AsyncSession();

        await session.ExecuteWriteAsync(async tx =>
        {
            var query = "MATCH (n) DETACH DELETE n";
            await tx.RunAsync(query);
        });
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
  }
}