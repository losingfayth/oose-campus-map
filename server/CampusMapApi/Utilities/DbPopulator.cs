using System;
using System.IO;
using System.Text.Json;
using CampusMapApi.Models;
using System.Text.Json.Serialization;
using CampusMapApi.Services;

namespace CampusMapApi.Utilities
{
	public static class DbPopulator
	{
		public static bool PopulatePoiCategories()
		{

			var query = "";

			return true;
		}

		public async static Task<bool> PopulatePoi()
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

			var neo4j = Neo4jServiceLocator.GetNeo4jService();
			var query = "MATCH (n:Area) RETURN n LIMIT 25";

			var result = await neo4j.ExecuteReadQueryAsync(query, new Dictionary<string, object>());

			Console.WriteLine(result);

			return true;
		}
	}
}