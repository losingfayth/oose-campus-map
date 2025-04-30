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
					campusGraph, {
						Location: {
						properties: ['latitude', 'longitude']
						}
					} , {
						CONNECTED_TO: {
						type: 'CONNECTED_TO',
						properties: 'distance'
						}
					})";

				await neo4j.ExecuteWriteQueryAsync(projectQuery);

				if (accessible)
				{
					var accessibleFilterQuery = @"
						CALL gds.beta.graph.subgraph(
							accessibleCampusGraph,
							campusGraph,
							'n.accessible <> false',
							'*'
						)
						YIELD graphName AS filteredGraph
					";

					await neo4j.ExecuteWriteQueryAsync(accessibleFilterQuery);
				}				

				return true;

			} catch (Exception e)
				{ Console.WriteLine($"Error generating graph project: {e.Message}"); }

			return true;
		}
	}
}