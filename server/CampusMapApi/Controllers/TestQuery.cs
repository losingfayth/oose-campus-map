using System.Threading.Tasks;
using Neo4j.Driver;
namespace CampusMapApi {

  public class TestQuery {

    public static async Task<List<LocationNode>> QueryTest() {

      // initial db connection
      var uri = "neo4j+s://apibloomap.xyz:7687";
      var username = Environment.GetEnvironmentVariable("DB_USER") 
        ?? throw new InvalidOperationException("DB_USER is not set");
      var password = Environment.GetEnvironmentVariable("DB_PASSWORD") 
        ?? throw new InvalidOperationException("DB_PASSWORD is not set");
        
      using var driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
                
      await using var session = _driver.AsyncSession();

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
          return locations;  
        });

      } catch (Exception ex) {
          Console.WriteLine($"Error: {ex.Message}");
      }

      return locations;  
    }
  }
}