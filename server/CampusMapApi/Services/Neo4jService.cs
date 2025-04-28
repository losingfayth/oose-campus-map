using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CampusMapApi.Models;

/**
 * <summary>
 * 	Neo4j Service
 * 		This class provides functions for other classes to connect to the neo4j database
 * </summary>
*/
namespace CampusMapApi.Services
{
	public class Neo4jService : IDisposable
	{

    	IDriver _driver;

		/**
		* <summary> Sets up the connection to the database </summary>
		*/
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

		/**
		 * <summary> Executes a read query in the database </summary>
		 * <param name="query">A neo4j cypher query</param>
		 * <param name="parameters">A string/object dictionary with parameter values</param> 
		 * <return>An IRecord containing the query result</return>
		 */
		public async Task<List<IRecord>> ExecuteReadQueryAsync(
			string query,
			object parameters = null
		){
			return await ExecuteAsync(query, parameters.ToNeo4jParameters());
		}

		/**
		 * <summary> Executes a write query in the database </summary>
		 * <param name="query">A neo4j cypher query</param>
		 * <param name="parameters">A string/object dictionary with parameter values</param> 
		 * <return>An IRecord containing the query result</return>
		 */
		public async Task<List<IRecord>> ExecuteWriteQueryAsync(
			string query, 
			object parameters = null
		){
			return await ExecuteAsync(query, parameters.ToNeo4jParameters(), false);
		}

		/**
		 * <summary> Executes a query in the database </summary>
		 * <param name="query">A neo4j cypher query</param>
		 * <param name="parameters">A string/object dictionary with parameter values</param> 
		 * <return>An IRecord containing the query result</return>
		 */
		private async Task<List<IRecord>> ExecuteAsync(
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
					
					return records;
				});
			}
			else
			{
				return await session.ExecuteWriteAsync(async tx =>
				{
					var result = await tx.RunAsync(query, parameters);
					var records = await result.ToListAsync();
					
					return records;
				});
			}
		}

		/// <summary>
		/// Disposes the connection object
		/// </summary>
		public void Dispose()
		{
			_driver?.Dispose();
			GC.SuppressFinalize(this);
		}
	}

	public static class Neo4jExtensions
	{
		public static Dictionary<string, object> ToNeo4jParameters(this object parameters)
		{
			if (parameters == null) return [];
			
			if (parameters is Dictionary<string, object> dict)
				return dict;
				
			return parameters.GetType()
				.GetProperties()
				.ToDictionary(
					p => p.Name,
					p => p.GetValue(parameters) ?? "null" // Neo4j prefers strings for nulls
				);
		}
	}
}