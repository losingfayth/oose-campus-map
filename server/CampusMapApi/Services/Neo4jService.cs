using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CampusMapApi.Services
{
	public class Neo4jService(string uri, string user, string pswd) : IDisposable
	{
		private readonly IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(user, pswd));

		public async Task<List<IRecord>> ExecuteReadQueryAsync(string qry)
		{
			using var session = _driver.AsyncSession();

			return await session.ExecuteReadAsync(async tx =>
			{
				var result = await tx.RunAsync(qry);
				return await result.ToListAsync();
			});
		}

		public async Task<List<IRecord>> ExecuteReadQueryAsync(string qry, IDictionary<string, object> parameters)
		{
			//parameters ??= new Dictionary<string, object>();

			using var session = _driver.AsyncSession();

			return await session.ExecuteReadAsync(async tx =>
			{
				var result = await tx.RunAsync(qry, parameters);
				return await result.ToListAsync();
			});
		}

		public async Task<List<IRecord>> ExecuteWriteQueryAsync(string query, IDictionary<string, object> parameters = null)
		{
			parameters ??= new Dictionary<string, object>();

			using var session = _driver.AsyncSession();
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
}