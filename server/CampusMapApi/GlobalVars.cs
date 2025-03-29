using CampusMapApi;

namespace CampusMapApi
{
	public static class GlobalVars
	{
		public static readonly int CodePrecision = 11;
		public static readonly string CodeAlphabet = "23456789CFGHJMPQRVWX";
		public static readonly char Separator = '+';
		public static readonly char PaddingCharacter = '0';
		public static readonly int SeparatorPosition = 8;
		public static readonly int MinDigitCount = 2;
		public static readonly int MaxDigitCount = 15;
		public static readonly int MaxEncodingLength = 10; // pair code length
		public static readonly int GridCodeLength = (MaxDigitCount - MaxEncodingLength);

		public static readonly int EncodingBase = CodeAlphabet.Length;
		public static readonly int LatitudeMax = 90;
		public static readonly int LongitudeMax = 180;
		public static readonly int GridColumns = 4;
		public static readonly int GridRows = 5;
		public static readonly long LatitudeMultiplier = 8000 * 3125;
		public static readonly long LongitudeMultiplier = 8000 * 1024;
		public static readonly long LatitudeSigDigit = (LatitudeMultiplier * EncodingBase * EncodingBase);
		public static readonly long LongitudeSigDigit = (LongitudeMultiplier * EncodingBase * EncodingBase);

		public static readonly double CampusLongitude = 41;
		public static readonly double CampusLatitude = -76;
		public static readonly string CampusGridCode = "87H5";

		public static readonly int EarthRadiusMi = 3956;
		public static readonly int CampusLat = 41;
		public static readonly int CampusLng = -76;
	}
}