using CampusMapApi;


namespace CampusMapApi.Models
{
	class OpenLocationCode
    {
		public required string Code { get; set; }

		public OpenLocationCode(string code)
		{
			if (code.Length == 8) code = GlobalVars.CampusGridCode + code;

			if (!this.Validate()) throw new Exception("Invalid code entered: " + code);

			Code = code;
		}

		public OpenLocationCode(GCSCoordinate coordinate, int length)
		{
			length = Math.Min(length, GlobalVars.MaxDigitCount);
			Code = ComputeCode(coordinate, length);
		}

		public int Length() { return Code.Length; }
    }

	static class OpenLocationCodeExtension
	{
		
		public static bool Validate(this OpenLocationCode codeObj)
		{
			string code = codeObj.Code;

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

		private static bool ValidateBloomCode(this OpenLocationCode codeObj)
		{
			string code = codeObj.Code;
			int count = 0;

			for (int i = 0; i < code.Length; i++)
			{
				if (GlobalVars.CodeAlphabet.Contains(code[i])) count ++;
			}

			return count == 7;
		}
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

		StringBuilder codeBuilder = new();

		long newLat = (long) (Math.Round((lat + GlobalVars.LatitudeMax) * GlobalVars.LatitudeMultiplier * 1e6) * 1e6);
		long newLng = (long) (Math.Round((lng + GlobalVars.LongitudeMax) * GlobalVars.LongitudeMultiplier * 1e6) * 1e6);

		if (length > GlobalVars.MaxEncodingLength)
		{
			for (int i = 0; i < GlobalVars.GridCodeLength; i++)
			{
				long latDigit = newLat % GlobalVars.GridRows;
				long lngDigit = newLng % GlobalVars.GridColumns;
				int ndx = (int) (latDigit * GlobalVars.GridColumns + lngDigit);
				codeBuilder.Append(GlobalVars.CodeAlphabet[ndx]);
				newLat /= GlobalVars.GridRows;
				newLng /= GlobalVars.GridColumns;
			}
		}
	}
}