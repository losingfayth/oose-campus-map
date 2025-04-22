using Neo4j.Driver;

namespace CampusMapApi.Models
{
	public class QueryResult
	{
		public List<INode> values = new List<INode>();

		public QueryResult(List<IRecord> records)
		{
			/*
			result.ForEach(record => {
				Console.WriteLine(record["n"].As<INode>().Properties["name"].As<string>());
			});
			*/

			records.ForEach(record => values.Add(record["n"].As<INode>()) );
		}
	}
}