using CampusMapApi.Services;

namespace CampusMapApi.Utilities
{
	public static class DbProjectionGenerator
	{
		public async static void GenerateAllProjections(Neo4jService neo4j)
		{
			await GenerateProjection(neo4j, true);
			await GenerateProjection(neo4j, false);
		}

		public async static Task<bool> GenerateProjection(Neo4jService neo4j, bool accessible)
		{
			try {

				var dropQuery = @"
					CALL gds.graph.drop($graph, false);
					";

				var graphType = accessible ? "stairlessCampusGraph" : "campusGraph";

				await neo4j.ExecuteWriteQueryAsync(dropQuery, new { graph = graphType } );


				var projectQuery = @"
					CALL gds.graph.project(
					$graph, {
						Location: {
						properties: ['latitude', 'longitude']

						" + (accessible ? 
						@",
							filters: { 
								exclude: [ 
									{ property: 'accessible', value: false } ]
								}" : ""
						) +
						@"}
					} , {
						CONNECTED_TO: {
						type: 'CONNECTED_TO',
						properties: 'distance'
						}
					})";


				await neo4j.ExecuteWriteQueryAsync(projectQuery, new { graph = graphType });

				return true;

			} catch (Exception e)
				{ Console.WriteLine($"Error generating graph project: {e.Message}"); }

			return true;
		}
	}
}