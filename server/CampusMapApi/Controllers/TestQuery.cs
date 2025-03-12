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

      // query to retrieve all nodes building and room number attributes
      var query = "MATCH (n) RETURN n.building AS building, n.roomNumber AS roomNumber, n.id AS id";

      var locations = new List<LocationNode>();
      
      try {
            
        var result = await session.RunAsync(query);

        // Process each record in the result set
        await result.ForEachAsync(record => {

          string building = record["building"].As<string>();
          string roomNumber = record["roomNumber"].As<string>();
          string id = record["id"].As<string>();

          string formattedRoom = $"{building} Room {roomNumber}";

          LocationNode node = new LocationNode();
          node.id = id;
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
  }
}