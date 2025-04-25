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
				var parameters = new Dictionary<string, object> { { "name", cat.ToString() } };

				await neo4j.ExecuteWriteQueryAsync(query, parameters);
			}

			return true;
		}

		public async static Task<bool> PopulatePoi(Neo4jService neo4j)
		{
			// File Path
			string fp = "../../db/jsons/poi.json";

			string json = File.ReadAllText(fp);

			//Console.WriteLine(json);

			var options = new JsonSerializerOptions
			{
				PropertyNameCaseInsensitive = true,
				Converters = { new JsonStringEnumConverter() }
			};

			var pois = JsonSerializer.Deserialize<Dictionary<string, PointOfInterest>>(json, options);

			//List<PointOfInterest> pois = JsonSerializer.Deserialize<List<PointOfInterest>>(json);

			
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

			/*
				MATCH (loc:Location) WHERE loc.name = 'Room $room' AND (loc)-[:IS_IN]->(bldg)
				MATCH (cat:PointOfInterestCategory) where cat.name = $cat
				CREATE (poi:PointOfInterest {
					name: $name,
					abbreviation: $abbr
				})-[:IN_CATEGORY]->(cat)
				CREATE (poi)-[:AT_LOCATION]->(loc)
				RETURN poi
			*/
			


			foreach (KeyValuePair<string, PointOfInterest> poi in pois)
			{ 
				//Console.WriteLine(poi.Value.Name + " " + poi.Value.Category);

				if (poi.Value.Room != "")
				{
					//Console.WriteLine(poi.Value.Name);
					var results = await neo4j.ExecuteReadQueryAsync(
						query,
						new Dictionary<string, object> {
							{ "name", poi.Value.Name },
							{ "abbreviation", poi.Value.Abbreviation ?? "" },
							{ "room", poi.Value.Room ?? "" },
							{ "building", poi.Value.Building },
							{ "category", poi.Value.Category.ToString() }
						}
					);
/*
				results.values.ForEach(record => {
				Console.WriteLine(record.Properties["name"].As<string>());
			});
				}
			}
			*/

			//var neo4j = Neo4jServiceLocator.GetNeo4jService();

			//var query = "MATCH (n:Area) RETURN n LIMIT 25";

			//var result = await neo4j.ExecuteReadQueryAsync(query);

			//Console.WriteLine(result);
			
			/*
			result.values.ForEach(record => {
				//Console.WriteLine(record["name"]);
				Console.WriteLine(record.Properties["name"].As<string>());
			});
			*/

			return true;
		}
	}
}