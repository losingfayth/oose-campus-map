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
		public static bool PopulatePoiCategories()
		{
			var query = "CREATE ($nodeLabel:PointOfInterestCategory {name:'$nameField'})";

			foreach (var cat in Enum.GetValues(typeof(PointOfInterestCategory)))
			{
				Console.WriteLine(cat.ToString());
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

			//foreach (KeyValuePair<string, PointOfInterest> poi in pois)
			//{ Console.WriteLine(poi.Value.Name + " " + poi.Value.Category); }

			//var neo4j = Neo4jServiceLocator.GetNeo4jService();

			var query = "MATCH (n:Area) RETURN n LIMIT 25";

			var result = await neo4j.ExecuteReadQueryAsync(query);

			//Console.WriteLine(result);

			result.ForEach(record => {
				//Console.WriteLine(record["name"]);
				Console.WriteLine(record["n"].As<INode>().Properties["name"].As<string>());
			});

			return true;
		}
	}
}