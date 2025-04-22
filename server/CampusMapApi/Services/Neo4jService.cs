using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CampusMapApi.Services
{
	public class Neo4jService : IDisposable
	{

    	IDriver _driver;

		public Neo4jService() {
			string uri = "neo4j+s://apibloomap.xyz:7687";
			string username = Environment.GetEnvironmentVariable("DB_USER")
				?? throw new InvalidOperationException("DB_USER is not set");
			string password = Environment.GetEnvironmentVariable("DB_PASSWORD")
				?? throw new InvalidOperationException("DB_PASSWORD is not set");

			_driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
		}

		/*
		public async Task<List<IRecord>> ExecuteReadQueryAsync(string query)
		{
			using var session = _driver.AsyncSession();

			/*return await session.ExecuteReadAsync(async tx =>
			{
				var result = await tx.RunAsync(qry);
				return await result.ToListAsync();
			});

			var result = await session.RunAsync(query);
			return await result.ToListAsync();
		}
		*/

		public async Task<QueryResult> ExecuteReadQueryAsync(
			string query,
			IDictionary<string, object> parameters = null
		){
			using var session = _driver.AsyncSession();

			parameters ??= new Dictionary<string, object>();

			return await session.ExecuteReadAsync(async tx =>
			{
				var result = await tx.RunAsync(query, parameters);
				var records = await result.ToListAsync();
				
				return new QueryResult(records);
			});
		}

		public async Task<List<IRecord>> ExecuteWriteQueryAsync(
			string query, 
			IDictionary<string, object> parameters = null
		){
			using var session = _driver.AsyncSession();

			parameters ??= new Dictionary<string, object>();

			return await session.ExecuteWriteAsync(async tx =>
			{
				var result = await tx.RunAsync(query, parameters);
				return await result.ToListAsync();
			});
		}

		public void Dispose()
		{
			_driver?.Dispose();
			GC.SuppressFinalize(this);
		}
	}

	public class QueryResult
	{
		List<INode> values;

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