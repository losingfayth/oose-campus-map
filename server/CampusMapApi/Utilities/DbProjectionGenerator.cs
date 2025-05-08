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

				await neo4j.ExecuteWriteQueryAsync(dropQuery, new { graph = "campusGraph"} );

				var projectStandardQuery = @"
				CALL gds.graph.project(
				'campusGraph', {
					Location: {
						properties: ['latitude', 'longitude', 'isAccessible']
					}
				} , {
					CONNECTED_TO: {
					type: 'CONNECTED_TO',
					properties: 'distance'
					}
				})";

				await neo4j.ExecuteWriteQueryAsync(projectStandardQuery);


				var graphType = accessible ? "accessibleCampusGraph" : "campusGraph";

				if (accessible)
				{
					await neo4j.ExecuteWriteQueryAsync(dropQuery, new { graph = "accessibleCampusGraph" } );

					var filterAccessibleQuery = @"
						CALL gds.graph.filter(
							'accessibleCampusGraph',
							'campusGraph',
							'n.isAccessible = 1',
							'*'
						)
						YIELD graphName, fromGraphName, nodeCount, relationshipCount
					";

					await neo4j.ExecuteWriteQueryAsync(filterAccessibleQuery);
				}
				else
				{
					await neo4j.ExecuteWriteQueryAsync(dropQuery, new { graph = "campusGraph"} );

					var projectStandardQuery = @"
					CALL gds.graph.project(
					'campusGraph', {
						Location: {
							properties: ['latitude', 'longitude', 'isAccessible']
						}
					} , {
						CONNECTED_TO: {
						type: 'CONNECTED_TO',
						properties: 'distance'
						}
					})";

					await neo4j.ExecuteWriteQueryAsync(projectStandardQuery);
				}			

				return true;

			} catch (Exception e)
				{ Console.WriteLine($"Error generating graph project: {e.Message}"); }

			return true;
		}
	}
}