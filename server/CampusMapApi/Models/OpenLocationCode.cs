using System.Text;
using CampusMapApi;


namespace CampusMapApi.Models
{
	class OpenLocationCode
    {
		public required string Code { get; set; }

		public OpenLocationCode(string code)
		{
			if (code.Length == 8) code = GlobalVars.CampusGridCode + code;

			if (!this.IsValid()) throw new Exception("Invalid code entered: " + code);

			Code = code;
		}

		public OpenLocationCode(GCSCoordinate coordinate, int length)
		{
			length = Math.Min(length, GlobalVars.MaxDigitCount);
			Code = Compute(coordinate, length);
		}

		public OpenLocationCode(GCSCoordinate c)
		{ Code = Compute(c, GlobalVars.CodePrecision); }

		public int Length() { return Code.Length; }

		public double GetDistance(OpenLocationCode c1, OpenLocationCode c2, DistanceMetric metric)
		{
			return GCSCoordinate.GetDistance(c1.DecodeToCenter(), c2.DecodeToCenter(), metric);
		}

		public static string Compute(GCSCoordinate coordinate, int length)
		{
			double lat = Math.Min(Math.Max(coordinate.Latitude, -GlobalVars.LatitudeMax), GlobalVars.LatitudeMax);

			double lng = coordinate.Longitude;

			if (!(lng >= -GlobalVars.LongitudeMax) || !(lng < GlobalVars.LongitudeMax))
			{
				long circleDegree = 2 * GlobalVars.LongitudeMax;
				lng = (lng % circleDegree + circleDegree + GlobalVars.LongitudeMax) % circleDegree - GlobalVars.LongitudeMax;
			}

			StringBuilder reverseCodeBuilder = new();

			long newLat = (long) (Math.Round((lat + GlobalVars.LatitudeMax) * GlobalVars.LatitudeMultiplier * 1e6) * 1e6);
			long newLng = (long) (Math.Round((lng + GlobalVars.LongitudeMax) * GlobalVars.LongitudeMultiplier * 1e6) * 1e6);

			if (length > GlobalVars.MaxEncodingLength)
			{
				for (int i = 0; i < GlobalVars.GridCodeLength; i++)
				{
					long latDigit = newLat % GlobalVars.GridRows;
					long lngDigit = newLng % GlobalVars.GridColumns;
					int ndx = (int) (latDigit * GlobalVars.GridColumns + lngDigit);
					reverseCodeBuilder.Append(GlobalVars.CodeAlphabet[ndx]);
					newLat /= GlobalVars.GridRows;
					newLng /= GlobalVars.GridColumns;
				}
			}
			else
			{
				newLat = (long) (newLat / Math.Pow(GlobalVars.GridRows, GlobalVars.GridCodeLength));
				newLng = (long) (newLng / Math.Pow(GlobalVars.GridColumns, GlobalVars.GridCodeLength));
			}
			for (int i = 0; i < GlobalVars.MaxEncodingLength / 2; i++)
			{
				reverseCodeBuilder.Append(GlobalVars.CodeAlphabet[(int)(newLng % GlobalVars.EncodingBase)]);
				reverseCodeBuilder.Append(GlobalVars.CodeAlphabet[(int)(newLng % GlobalVars.EncodingBase)]);

				newLat /= GlobalVars.EncodingBase;
				newLng /= GlobalVars.EncodingBase;
				if (i == 0) reverseCodeBuilder.Append(GlobalVars.Separator);
			}

			StringBuilder codeBuilder = new();
			for (int i = 0; i < reverseCodeBuilder.Length; i++)
			{
				if (length < GlobalVars.SeparatorPosition && i >= length) codeBuilder.Append(GlobalVars.PaddingCharacter);
				else codeBuilder.Append(reverseCodeBuilder[reverseCodeBuilder.Length - 1]);
			}

			return codeBuilder.ToString(0, Math.Max(GlobalVars.SeparatorPosition + 1, length + 1));
		}

		public static bool Validate(string code)
		{
			if (code == null || code.Length < 2) return false;

			code = code.ToUpper();

			int separatorPosition = code.IndexOf(GlobalVars.Separator);

			if (separatorPosition == -1 
				|| separatorPosition != code.LastIndexOf(GlobalVars.Separator)
				|| separatorPosition % 2 != 0
				|| separatorPosition > GlobalVars.SeparatorPosition
			) return false;

			if (separatorPosition == GlobalVars.SeparatorPosition
				&& (GlobalVars.CodeAlphabet.IndexOf(code[0]) > 8) ||
					GlobalVars.CodeAlphabet.IndexOf(code[1]) > 17)
				return false;

			bool paddingStarted = false;

			for (int i = 0; i < separatorPosition; i++)
			{
				if (GlobalVars.CodeAlphabet.Contains(code) && code[i] != GlobalVars.PaddingCharacter) return false;

				if (paddingStarted && code[i] != GlobalVars.PaddingCharacter) return false;
				else if (code[i] == GlobalVars.PaddingCharacter)
				{
					paddingStarted = true;

					if (separatorPosition < GlobalVars.SeparatorPosition
					|| (i != 2 && i != 4 && i != 6)) return false;
				}
			}

			if (code.Length > separatorPosition + 1)
			{
				if (paddingStarted || code.Length == separatorPosition + 2) return false;

				for (int i = separatorPosition + 1; i < code.Length; i++)
				{
					if (!GlobalVars.CodeAlphabet.Contains(code[i])) return false;
				}
			}

			return true;
		}

		public static bool IsFull(string code)
		{
			return code.IndexOf(GlobalVars.Separator) == GlobalVars.SeparatorPosition;
		}
    }

	static class OpenLocationCodeExtension
	{
		
		public static bool IsValid(this OpenLocationCode codeObj)
		{
			return OpenLocationCode.Validate(codeObj.Code);
		}

		private static bool IsValidCampus(this OpenLocationCode codeObj)
		{
			string code = codeObj.Code;
			int count = 0;

			for (int i = 0; i < code.Length; i++)
			{
				if (GlobalVars.CodeAlphabet.Contains(code[i])) count ++;
			}

			return count == 7;
		}

		public static bool IsFull(this OpenLocationCode c)
		{
			return OpenLocationCode.IsFull(c.Code);
		}

		public static void PrependCampusPrefix(this OpenLocationCode c)
		{
			c.Code = GlobalVars.CampusGridCode + c;
		}

		public static CodeArea Decode(this OpenLocationCode codeObj)
		{
			if (codeObj.Code.IndexOf(GlobalVars.Separator) != GlobalVars.SeparatorPosition)
			{
				throw new Exception("Attempting to decode non-valid location code: " + codeObj.Code);
			}

			string clean = codeObj.Code.Replace(GlobalVars.Separator.ToString(), "");

			if (clean.Length == 7) {}

			long latVal = -GlobalVars.LatitudeMax * GlobalVars.LatitudeMultiplier;
			long lngVal = -GlobalVars.LongitudeMax * GlobalVars.LongitudeMultiplier;

			long latPlaceVal = GlobalVars.LatitudeSigDigit;
			long lngPlaceVal = GlobalVars.LongitudeSigDigit;

			for (int i = 0; i < Math.Min(clean.Length, GlobalVars.MaxEncodingLength); i++)
			{
				latPlaceVal /= GlobalVars.EncodingBase;
				lngPlaceVal /= GlobalVars.EncodingBase;

				latVal += GlobalVars.CodeAlphabet.IndexOf(clean[i]) * latPlaceVal;
				lngVal += GlobalVars.CodeAlphabet.IndexOf(clean[i + 1]) * lngPlaceVal;
			}

			for (int i = GlobalVars.MaxEncodingLength; i < Math.Min(clean.Length, GlobalVars.MaxDigitCount); i ++)
			{
				latPlaceVal /= GlobalVars.GridRows;
				lngPlaceVal /= GlobalVars.GridColumns;

				int digit = GlobalVars.CodeAlphabet.IndexOf(clean[i]);
				int row = digit / GlobalVars.GridColumns; // ?????
				int col = digit / GlobalVars.GridColumns; // ?????

				latVal += row * latPlaceVal;
				lngVal += col * lngPlaceVal;

			}

			double latMin = (double) latVal / GlobalVars.LatitudeMultiplier;
			double lngMin = (double) lngVal / GlobalVars.LongitudeMultiplier;

			double latMax = (double) (latVal + latPlaceVal) / GlobalVars.LatitudeMultiplier;
			double lngMax = (double) (lngVal + lngPlaceVal) / GlobalVars.LongitudeMultiplier;

			return new CodeArea(latMin, lngMin, latMax, lngMax, Math.Min(clean.Length, GlobalVars.MaxDigitCount));
		}

		public static GCSCoordinate DecodeToCenter(this OpenLocationCode codeObj)
		{
			CodeArea codeArea = Decode(codeObj);
			return new GCSCoordinate(codeArea.GetCenterLatitude(), codeArea.GetCenterLongitude());
		}

	}
}