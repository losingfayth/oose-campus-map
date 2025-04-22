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
			string fp = "../../db/jsons/poa.json";
			//D:\Code\SP25\oose-campus-map\db\jsons\poa.json

			string json = File.ReadAllText(fp);

			//Console.WriteLine(json);

			var options = new JsonSerializerOptions
			{
				PropertyNameCaseInsensitive = true,
				Converters = { new JsonStringEnumConverter() }
			};

			var pois = JsonSerializer.Deserialize<Dictionary<string, PointOfInterest>>(json, options);

			//List<PointOfInterest> poas = JsonSerializer.Deserialize<List<PointOfInterest>>(json);

			/*
			var query = @"
				CREATE (n:PointOfInterest { name: $name })
			";

			foreach (KeyValuePair<string, PointOfInterest> poi in pois)
			{ 
				//Console.WriteLine(poi.Value.Name + " " + poi.Value.Category);

				if (poi.Value.Room != "")
				{
					if (poi.Value.Room != null)
					{

					}
					else
					{
						var abbrQuery = @"
							CREATE (n:PointOfInterest { name: $name, abbr: $abbr })";
					}
				}
			}
			*/

			//var neo4j = Neo4jServiceLocator.GetNeo4jService();

			var query = "MATCH (n:Area) RETURN n LIMIT 25";

			var result = await neo4j.ExecuteReadQueryAsync(query);

			//Console.WriteLine(result);
			
			result.values.ForEach(record => {
				//Console.WriteLine(record["name"]);
				Console.WriteLine(record.Properties["name"].As<string>());
			});

			return true;
		}
	}
}