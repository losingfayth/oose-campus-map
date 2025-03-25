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
}