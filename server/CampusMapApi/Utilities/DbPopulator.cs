using System;
using System.IO;
using System.Text.Json;
using CampusMapApi.Models;
using System.Text.Json.Serialization;
using CampusMapApi.Services;
using Neo4j.Driver;

namespace CampusMapApi.Utilities
{
	public static class DbPopulator
	{
		public async static Task<bool> PopulatePoiCategories(Neo4jService neo4j)
		{
			var query = @"
			CREATE (n:PointOfInterestCategory { name: $name })";

			foreach (var cat in Enum.GetValues(typeof(PointOfInterestCategory)))
			{
				var parameters = new Dictionary<string, object> { { "name", cat.ToString() ?? ""} };

				await neo4j.ExecuteWriteQueryAsync(query, parameters);
			}

			return true;
		}

		public async static Task<bool> PopulatePoi(Neo4jService neo4j)
		{
			string fp = "../../db/jsons/poi.json";

			string json = File.ReadAllText(fp);

			var options = new JsonSerializerOptions
			{
				PropertyNameCaseInsensitive = true,
				Converters = { new JsonStringEnumConverter() }
			};

			var pois = JsonSerializer.Deserialize<Dictionary<string, PointOfInterest>>(json, options);
			
			const string query = @"
				MATCH (cat:PointOfInterestCategory) WHERE cat.name = $category
				MATCH (bldg:Area) WHERE bldg.name = $building
				MATCH (loc:Location) WHERE loc.name = 'Room ' + $room AND (loc)-[:IS_IN]->(bldg)
				CREATE (n:PointOfInterest { 
					name: $name, 
					abbreviation: $abbreviation
				})-[:IN_CATEGORY]->(cat)
				CREATE (n)-[:LOCATED_AT]->(loc)
				RETURN n
			";

			if (pois != null)
			{
				foreach (KeyValuePair<string, PointOfInterest> poi in pois)
				{ 

					if (poi.Value.Room != "")
					{
						var results = await neo4j.ExecuteWriteQueryAsync(
							query,
							new Dictionary<string, object> {
								{ "name", poi.Value.Name },
								{ "abbreviation", poi.Value.Abbreviation ?? "" },
								{ "room", poi.Value.Room ?? "" },
								{ "building", poi.Value.Building ?? "" },
								{ "category", poi.Value.Category.ToString() }
							}
						);
					}
				}
			}

			return true;
		}
	}
}