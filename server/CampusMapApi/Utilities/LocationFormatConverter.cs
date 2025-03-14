using CampusMapApi;

namespace CampusMapApi.Utilities
{
	class LocationFormatConverter
	{
		static readonly int _codePrecision = 11;
		static readonly string _codeAlphabet = "23456789CFGHJMPQRVWX";
		static readonly char _separator = '+';
		static readonly char _paddingCharacter = '0';
		static readonly int _separatorPosition = 8;
		static readonly int _minDigitCount = 2;
		static readonly int _maxDigitCount = 15;
		static readonly int _maxEncodingLength = 10; // pair code length
		static readonly int _gridCodeLength = (_maxDigitCount - _maxEncodingLength);

		static readonly int _encodingBase = _codeAlphabet.Length;
		static readonly int _latitudeMax = 90;
		static readonly int _longitudeMax = 180;
		static readonly int _gridColumns = 4;
		static readonly int _gridRows = 5;
		static readonly long _latitudeMultiplier = 8000 * 3125;
		static readonly long _longitudeMultiplier = 8000 * 1024;
		static readonly long _latitudeSigDigit = (_latitudeMultiplier * _encodingBase * _encodingBase);
		static readonly long _longitudeSigDigit = (_longitudeMultiplier * _encodingBase * _encodingBase);
	}
}