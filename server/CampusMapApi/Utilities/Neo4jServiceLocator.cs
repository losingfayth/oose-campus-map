using CampusMapApi.Services;

namespace CampusMapApi.Utilities
{
	public static class Neo4jServiceLocator
	{
		public static IServiceProvider? Services { get; set; }

		public static Neo4jService GetNeo4jService()
		{
			return Services.GetRequiredService<Neo4jService>();
		}
	}
}