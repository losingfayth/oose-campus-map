
/**
Generates a new graph projection. Regernates campusGraph if user types 1,
stairlessCampusGraph if user selects 2, and both if user selects 3. 0 to
exit program.

@author Jessica Ruehle
*/
namespace CampusMapApi {


    public class GraphRegenerator {
        static async Task Main(string[] args) {

            while (true) {
                // make request to user
                string request = "Enter 1 to regenerate the whole graph projection, 2 to regenerate the stairless graph projection, or 3 to regenerate both. Type 0 to exit.";
                Console.WriteLine(request);

                // retrieve input from console
                string input = Console.ReadLine();
                int selection = int.Parse(input);

                // resultant strings
                string success = "Graph projection successfully regenerated";
                string fail = "Graph projection failed to regenerate";

                // interpret user choice and perform appropriate action. display
                // result of regeneration
                if (selection == 1) {
                    bool state = await RegRegen();
                    if (state) {Console.WriteLine(success);}
                    else {Console.WriteLine(fail);}

                } else if (selection == 2) {
                    bool state = await StairlessRegen();
                    if (state) {Console.WriteLine(success);}
                    else {Console.WriteLine(fail);}

                } else if (selection == 3) {
                    bool state1 = await RegRegen();
                    bool state2 = await StairlessRegen();
                    if (state1) {Console.WriteLine(success);}
                    else {Console.WriteLine(fail);}
                    if (state2) {Console.WriteLine(success);}
                    else {Console.WriteLine(fail);}

                } else if (selection == 0) {
                    break;
                
                } else {
                    Console.WriteLine("Invalid input. No graph regeneration performed.");
                }
            }
        }
    }

    /**
    Drops the existing campusGraph graph projection in Neo4j and creates a new projection.
    */
    private bool RegRegen() {

        // inital db connection setup
        var uri = "neo4j+s://apibloomap.xyz:7687";
        var username = Environment.GetEnvironmentVariable("DB_USER")
        ?? throw new InvalidOperationException("DB_USER is not set");
        var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
        ?? throw new InvalidOperationException("DB_PASSWORD is not set");

        IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
        await using var session = _driver.AsyncSession();

        try {
            // drop existing graph projection
            var dropProjection = @"
                CALL gds.graph.drop('campusGraph', false);";
            await session.RunAsync(dropProjection);

            // create new graph projection
            var createProjection = @"
                CALL gds.graph.project(
                'campusGraph', {
                    Location: {
                    properties: ['latitude', 'longitude']
                    }
                } , {
                    CONNECTED_TO: {
                    type: 'CONNECTED_TO',
                    properties: 'distance'
                    }
                })";

            // run prjection creation query
            await session.RunAsync(createProjection);
            return true;
        } catch (Exception e) {
            Console.WriteLine($"Error: {e.Message}");
            return false;
        }
    }

    /**
    Drops the existing stairlessCampusGraph graph projection in Neo4j and creates
    a new projection. This differs from the campusGraph projection in that it
    excludes any node that is a stair, such that accessible pathways can be generated.
    */
    private bool StairlessRegen() {
        
        // initial db connection setup
        var uri = "neo4j+s://apibloomap.xyz:7687";
        var username = Environment.GetEnvironmentVariable("DB_USER")
        ?? throw new InvalidOperationException("DB_USER is not set");
        var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
        ?? throw new InvalidOperationException("DB_PASSWORD is not set");

        IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
        await using var session = _driver.AsyncSession();

        try {
            // drop existing graph projection
            var dropProjection = @"
                CALL gds.graph.drop('stairlessCampusGraph', false);";
            await session.RunAsync(dropProjection);

            // create new graph projection
            var createProjection = @"
                CALL gds.graph.project(
                'stairlessCampusGraph', {
                    Location: {
                    properties: ['latitude', 'longitude']
                    }
                } , {
                    CONNECTED_TO: {
                    type: 'CONNECTED_TO',
                    properties: 'distance'
                    }
                })";

            // run prjection creation query
            await session.RunAsync(createProjection);
            return true;
        } catch (Exception e) {
            Console.WriteLine($"Error: {e.Message}");
            return false;
        }

    }
}