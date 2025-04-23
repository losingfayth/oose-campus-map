using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CampusMapApi.Models;

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

			_driver = GraphDatabase.Driver(
				uri,
				AuthTokens.Basic(username, password)
			);
		}

		public async Task<QueryResult> ExecuteReadQueryAsync(
			string query,
			IDictionary<string, object> parameters = null
		){
			return await ExecuteAsync(query, parameters);
		}

		public async Task<QueryResult> ExecuteWriteQueryAsync(
			string query, 
			IDictionary<string, object> parameters = null
		){
			return await ExecuteAsync(query, parameters, false);
		}

		private async Task<QueryResult> ExecuteAsync(
			string query,
			IDictionary<string, object> parameters,
			bool read = true
		){
			using var session = _driver.AsyncSession();

			parameters ??= new Dictionary<string, object>();

			if (read)
			{
				return await session.ExecuteReadAsync(async tx =>
				{
					var result = await tx.RunAsync(query, parameters);
					var records = await result.ToListAsync();
					
					return new QueryResult(records);
				});
			}
			else
			{
				return await session.ExecuteWriteAsync(async tx =>
				{
					var result = await tx.RunAsync(query, parameters);
					var records = await result.ToListAsync();

					Console.WriteLine(result);
					
					return new QueryResult(records);
				});
			}
		}

		public void Dispose()
		{
			_driver?.Dispose();
			GC.SuppressFinalize(this);
		}
	}
}