

using System.Reflection.Metadata;
using System.Text;

/// <summary>
/// This class should cover all conversions between latitude/longitude to Plus code required for
/// our project. Of note:
/// 
/// Latitudes/Longitude pairs are abstracted into a Coordinate - which can be created with
/// Latitudes/Longitude, or the distinct degrees, minutes, and seconds for each, or (if the location
/// is on Bloomsburg campus), just the minutes and seconds for lat and lng.
/// 
/// We say that the Coordinate is "encoded" into a Plus code. Similarly, a Plus code is "decoded" back
/// into either a CodeArea or a Coordinate.
/// A Plus Code refers to a rectangular bounding box - the default for this codebase is an 11 digit Plus code,
/// which corresponds to an approximately 3x3 meter bound. A CodeArea object gives information for
/// the north/south/east/west values of that bounding box, in latitude/longitude respectively.
/// Decoding a Plus code to a Coordinate object gives the latitude/longitude of the CENTER of the bounds.
/// 
/// Much like the Coordinate objects can be created with a shorthand if they're on Bloomsburg Campus,
/// Plus codes can be as well. An 11 digit Plus code looks like "87H52H42+WJF". By using designated 
/// constructors/methods, that can be shortened to "2H42+WJF" - which is the exact form that Google Maps
/// will give.
/// 
/// IMPORTANT -
/// Google Maps will often give coordinates in the form "41°00'26.4"N 76°26'54.5"W". This means the latitude
/// is 41 degrees, 0 minutes, and 26.4 seconds, and the longitude is NEGATIVE 76 degrees, NEGATIVE 26 minutes
/// and NEGATIVE 54.5 seconds. East is positive, West is negative. If the longitude is given w.r.t. west,
/// the Coordinate object needs to be given negative values. 
/// 
/// *********************
/// 
/// There is a static method ExampleUsage() that gives ... example usage.
/// 
/// Dakotah
/// 
/// SOURCES
/// https://github.com/google/open-location-code
/// Some doc comments converted to C# style by ChatGPT
/// </summary>
/// 

public class CoordinateConverter
{

    // The latitude of the campus in degrees.
    public static readonly int CAMPUS_LAT_DEGREES = 41;

    // The longitude of the campus in degrees.
    public static readonly int CAMPUS_LNG_DEGREES = -76;

    // The grid code for the campus location.
    public static readonly string CAMPUS_LOC_GRID = "87H5";

    // Provides a normal precision code, approximately 2.8x3.5 meters.
    public static readonly int CODE_PRECISION_NORMAL = 11;

    // The character set used to encode the values.
    public static readonly string CODE_ALPHABET = "23456789CFGHJMPQRVWX";


    // A separator used to break the code into two parts to aid memorability.
    public static readonly char SEPARATOR = '+';

    // The character used to pad codes.
    public static readonly char PADDING_CHARACTER = '0';

    // The number of characters to place before the separator.
    private static readonly int SEPARATOR_POSITION = 8;

    // The minimum number of digits in a Plus Code.
    public static readonly int MIN_DIGIT_COUNT = 2;

    // The max number of digits to process in a Plus Code.
    public static readonly int MAX_DIGIT_COUNT = 15;

    // Maximum code length using just lat/lng pair encoding.
    private static readonly int PAIR_CODE_LENGTH = 10;

    // Number of digits in the grid coding section.
    private static readonly int GRID_CODE_LENGTH = MAX_DIGIT_COUNT - PAIR_CODE_LENGTH;

    // The base to use to convert numbers to/from.
    private static readonly int ENCODING_BASE = CODE_ALPHABET.Length;

    // The maximum value for latitude in degrees.
    private static readonly long LATITUDE_MAX = 90;

    // The maximum value for longitude in degrees.
    private static readonly long LONGITUDE_MAX = 180;

    // Number of columns in the grid refinement method.
    private static readonly int GRID_COLUMNS = 4;

    // Number of rows in the grid refinement method.
    private static readonly int GRID_ROWS = 5;

    // Value to multiple latitude degrees to convert it to an integer with the maximum encoding
    // precision. I.e. ENCODING_BASE**3 * GRID_ROWS**GRID_CODE_LENGTH
    private static readonly long LAT_INTEGER_MULTIPLIER = 8000 * 3125;

    // Value to multiple longitude degrees to convert it to an integer with the maximum encoding
    // precision. I.e. ENCODING_BASE**3 * GRID_COLUMNS**GRID_CODE_LENGTH
    private static readonly long LNG_INTEGER_MULTIPLIER = 8000 * 1024;

    // Value of the most significant latitude digit after it has been converted to an integer.
    private static readonly long LAT_MSP_VALUE = LAT_INTEGER_MULTIPLIER * ENCODING_BASE * ENCODING_BASE;

    // Value of the most significant longitude digit after it has been converted to an integer.
    private static readonly long LNG_MSP_VALUE = LNG_INTEGER_MULTIPLIER * ENCODING_BASE * ENCODING_BASE;


    /// <summary>
    /// Represents an Open Location Code (OLC), which is a code that represents a geographic location.
    /// </summary>
    public class OpenLocationCode
    {
        private readonly string _code;


        /// <summary>
        /// Initializes an OpenLocationCode with a given code.
        /// </summary>
        /// <param name="code">The OLC string representing the location.</param>
        public OpenLocationCode(string code)
        {

            if (code.Length == 8) {
                code = CAMPUS_LOC_GRID + code;
            }

            string upper = code.ToUpper();
            if (!IsValidCode(upper))
            {
                throw new Exception("Invalid Plus code entered: " + code);
            }
            _code = code;
        }

        /// <summary>
        /// Initializes an OpenLocationCode based on a given coordinate and code length.
        /// </summary>
        /// <param name="coordinate">The coordinate to encode.</param>
        /// <param name="codeLength">The length of the code to generate.</param>
        public OpenLocationCode(Coordinate coordinate, int codeLength)
        {
            codeLength = Math.Min(codeLength, MAX_DIGIT_COUNT);
            _code = ComputeCode(coordinate, codeLength);

        }

        /// <summary>
        /// Returns the location code
        /// </summary>
        public string GetCode()
        {
            return _code;
        }

        /// <summary>
        /// Initializes an OpenLocationCode based on a given coordinate with default precision.
        /// </summary>
        /// <param name="c">The coordinate to encode.</param>
        public OpenLocationCode(Coordinate c)
        {
            _code = ComputeCode(c, CODE_PRECISION_NORMAL);
        }

        public static OpenLocationCode AppendBloomPrefix(string code)
        {
            return new OpenLocationCode(CAMPUS_LOC_GRID + code);
        }

        /// <summary>
        /// Computes an Open Location Code based on a given coordinate and code length.
        /// </summary>
        /// <param name="coordinate">The geographic coordinate to encode.</param>
        /// <param name="codeLength">The desired length of the code.</param>
        /// <returns>The encoded Open Location Code as a string.</returns>
        private static string ComputeCode(Coordinate coordinate, int codeLength)
        {
            double latitude = ClipLatitude(coordinate.GetLatitude());
            double longitude = NormalizeLongitude(coordinate.GetLongitude());

            StringBuilder reverseCodeBuilder = new();

            // Multiply values by their precision and convert to positive. Rounding
            // avoids/minimises errors due to floating point precision.
            long latVal =
                    (long)(Math.Round((latitude + LATITUDE_MAX) * LAT_INTEGER_MULTIPLIER * 1e6) / 1e6);
            long lngVal =
                    (long)(Math.Round((longitude + LONGITUDE_MAX) * LNG_INTEGER_MULTIPLIER * 1e6) / 1e6);

            // Compute the grid part of the code if necessary.
            if (codeLength > PAIR_CODE_LENGTH)
            {
                for (int i = 0; i < GRID_CODE_LENGTH; i++)
                {
                    long latDigit = latVal % GRID_ROWS;
                    long lngDigit = lngVal % GRID_COLUMNS;
                    int ndx = (int)(latDigit * GRID_COLUMNS + lngDigit);
                    reverseCodeBuilder.Append(CODE_ALPHABET[ndx]);
                    latVal /= GRID_ROWS;
                    lngVal /= GRID_COLUMNS;
                }
            }
            else
            {
                latVal = (long)(latVal / Math.Pow(GRID_ROWS, GRID_CODE_LENGTH));
                lngVal = (long)(lngVal / Math.Pow(GRID_COLUMNS, GRID_CODE_LENGTH));
            }
            // Compute the pair section of the code.
            for (int i = 0; i < PAIR_CODE_LENGTH / 2; i++)
            {
                reverseCodeBuilder.Append(CODE_ALPHABET[(int)(lngVal % ENCODING_BASE)]);
                reverseCodeBuilder.Append(CODE_ALPHABET[(int)(latVal % ENCODING_BASE)]);
                latVal /= ENCODING_BASE;
                lngVal /= ENCODING_BASE;
                // If we are at the separator position, add the separator.
                if (i == 0)
                {
                    reverseCodeBuilder.Append(SEPARATOR);
                }
            }
            // reverse intermediate stage of location code
            StringBuilder codeBuilder = new();
            for (int i = 0; i < reverseCodeBuilder.Length; i++)
            {
                // If we need to pad the code, replace some of the digits.

                if (codeLength < SEPARATOR_POSITION && i >= codeLength)
                {
                    codeBuilder.Append(PADDING_CHARACTER);
                }
                else
                {
                    codeBuilder.Append(reverseCodeBuilder[reverseCodeBuilder.Length - 1 - i]);
                }
            }

            char[] arr = new char[Math.Max(SEPARATOR_POSITION + 1, codeLength + 1)];

            for (int i = 0; i < arr.Length; i++)
            {
                arr[i] = codeBuilder[i];
            }

            return new string(arr);
        }

        /// <summary>
        /// Decodes a 7-character Open Location Code on Bloomsburg campus into a bounding box (latitude/longitude range).
        /// </summary>
        /// <param name="code">The 7 character string representing a location in Bloomsburg to decode.</param>
        /// <returns>A CodeArea object representing the bounding box of the code.</returns>
        public static CodeArea DecodeBloom(string code)
        {
            return new OpenLocationCode(CAMPUS_LOC_GRID + code).Decode();
        }

        /// <summary>
        /// Decodes a 7-character Open Location Code on Bloomsburg campus  to the center coordinates of the bounding box.
        /// </summary>
        /// <param name="code">The 7 character string representing a location in Bloomsburg to decode.</param>
        /// <returns>The center coordinate of the decoded bounding box.</returns>
        public static Coordinate DecodeBloomToCenter(string code)
        {
            return new OpenLocationCode(CAMPUS_LOC_GRID + code).DecodeToCenter();
        }


        /// <summary>
        /// Decodes the Open Location Code into a CodeArea that represents the latitude/longitude bounding box.
        /// </summary>
        /// <returns>A CodeArea object representing the bounding box of the code.</returns>
        public CodeArea Decode()
        {
            if (!IsFull(_code))
            {
                // throw exception
                throw new Exception("Attempting to decode non-valid location code: " + _code);
            }
            string clean = _code.Replace(SEPARATOR.ToString(), "");

            // Bloomsburg campus specific area code, pre-pend the static prefix constant
            // across campus
            if (clean.Length == 7)
            {

            }

            // Initialise the values. We work them out as integers and convert them to doubles at the end.
            long latVal = -LATITUDE_MAX * LAT_INTEGER_MULTIPLIER;
            long lngVal = -LONGITUDE_MAX * LNG_INTEGER_MULTIPLIER;
            // Define the place value for the digits. We'll divide this down as we work through the code.
            long latPlaceVal = LAT_MSP_VALUE;
            long lngPlaceVal = LNG_MSP_VALUE;
            for (int i = 0; i < Math.Min(clean.Length, PAIR_CODE_LENGTH); i += 2)
            {
                latPlaceVal /= ENCODING_BASE;
                lngPlaceVal /= ENCODING_BASE;
                latVal += CODE_ALPHABET.IndexOf(clean[i]) * latPlaceVal;
                lngVal += CODE_ALPHABET.IndexOf(clean[i + 1]) * lngPlaceVal;
            }

            for (int i = PAIR_CODE_LENGTH; i < Math.Min(clean.Length, MAX_DIGIT_COUNT); i++)
            {
                latPlaceVal /= GRID_ROWS;
                lngPlaceVal /= GRID_COLUMNS;
                int digit = CODE_ALPHABET.IndexOf(clean[i]);
                int row = digit / GRID_COLUMNS;
                int col = digit % GRID_COLUMNS;
                latVal += row * latPlaceVal;
                lngVal += col * lngPlaceVal;
            }

            double latitudeLo = (double)latVal / LAT_INTEGER_MULTIPLIER;
            double longitudeLo = (double)lngVal / LNG_INTEGER_MULTIPLIER;
            double latitudeHi = (double)(latVal + latPlaceVal) / LAT_INTEGER_MULTIPLIER;
            double longitudeHi = (double)(lngVal + lngPlaceVal) / LNG_INTEGER_MULTIPLIER;

            return new CodeArea(
    latitudeLo,
    longitudeLo,
    latitudeHi,
    longitudeHi,
    Math.Min(clean.Length, MAX_DIGIT_COUNT));

        }
        /// <summary>
        /// Decodes the Open Location Code into the center of the bounding box.
        /// </summary>
        /// <returns>A Coordinate object representing the center of the bounding box.</returns>
        public Coordinate DecodeToCenter()
        {
            CodeArea codeArea = Decode();
            return new Coordinate(codeArea.GetCenterLatitude(), codeArea.GetCenterLongitude());
        }

        /// <summary>
        /// Decodes the Open Location Code into the center of the bounding box.
        /// </summary>
        /// <param name="code">The OPL to decode.</param>

        /// <returns>A Coordinate object representing the center of the bounding box.</returns>
        public static Coordinate DecodeToCenter(string code)
        {
            return new OpenLocationCode(code).DecodeToCenter();
        }

        /// <summary>
        /// Decodes the Open Location Code into the center of the bounding box.
        /// </summary>
        /// <param name="code">The OPL to decode.</param>

        /// <returns>A CodeArea object representing the bounding box</returns>
        public static CodeArea Decode(string code)
        {
            return new OpenLocationCode(code).Decode();
        }
        

        private static double NormalizeLongitude(double longitude)
        {
            if (longitude >= -LONGITUDE_MAX && longitude < LONGITUDE_MAX)
            {
                // longitude is within proper range, no normalization necessary
                return longitude;
            }

            // % in C# is the same as in Java - I really wish that these programming 
            // languages used the mathematical definition, but none of them do.
            // Ensures that longitude is positive. -47 degrees == 313 degrees.
            long CIRCLE_DEG = 2 * LONGITUDE_MAX; // 360 degrees
            return (longitude % CIRCLE_DEG + CIRCLE_DEG + LONGITUDE_MAX) % CIRCLE_DEG - LONGITUDE_MAX;
        }

        private static double ClipLatitude(double latitude)
        {
            return Math.Min(Math.Max(latitude, -LATITUDE_MAX), LATITUDE_MAX);
        }

        public static string Encode(Coordinate coordinate) {
            return Encode(coordinate, CODE_PRECISION_NORMAL);
        }

        /// <summary>
        /// Encodes a latitude/longitude coordinate into an Open Location Code of the specified length.
        /// </summary>
        /// <param name="coordinate">The coordinate to encode.</param>
        /// <param name="codeLength">The desired length of the code.</param>
        /// <returns>The encoded Open Location Code.</returns>
        public static string Encode(Coordinate coordinate, int codeLength)
        {
            return new OpenLocationCode(coordinate, codeLength).GetCode();
        }

        /// <summary>
        /// Encodes a latitude and longitude into an Open Location Code of the specified length.
        /// </summary>
        /// <param name="latitude">The latitude in decimal degrees.</param>
        /// <param name="longitude">The longitude in decimal degrees.</param>
        /// <param name="codeLength">The desired length of the code.</param>
        /// <returns>The encoded Open Location Code.</returns>
        public static string Encode(double latitude, double longitude, int codeLength)
        {
            return Encode(new Coordinate(latitude, longitude), codeLength);
        }

        public static string EncodeInBloom(double latMin, double latSec, double lngMin, double lngSec)
        {
            return Encode(Coordinate.GetBloomsburgCoordinates(latMin, latSec, lngMin, lngSec), CODE_PRECISION_NORMAL);
        }

        /// <summary>
        /// Checks whether the given code is a valid Open Location Code.
        /// </summary>
        /// <param name="code">The code to validate.</param>
        // /// <returns>True if the code is valid, otherwise false.</returns>
        private static bool IsValidCode(string code)
        {

            if (code == null || code.Length < 2)
            {
                return false;
            }
            code = code.ToUpper();

            // There must be exactly one separator.
            int separatorPosition = code.IndexOf(SEPARATOR);
            if (separatorPosition == -1)
            {
                return false;
            }
            if (separatorPosition != code.LastIndexOf(SEPARATOR))
            {
                return false;
            }
            // There must be an even number of at most 8 characters before the separator.
            if (separatorPosition % 2 != 0 || separatorPosition > SEPARATOR_POSITION)
            {
                return false;
            }

            // Check first two characters: only some values from the alphabet are permitted.
            if (separatorPosition == SEPARATOR_POSITION)
            {
                // First latitude character can only have first 9 values.
                if (CODE_ALPHABET.IndexOf(code[0]) > 8)
                {
                    return false;
                }

                // First longitude character can only have first 18 values.
                if (CODE_ALPHABET.IndexOf(code[1]) > 17)
                {
                    return false;
                }
            }

            // Check the characters before the separator.
            bool paddingStarted = false;
            for (int i = 0; i < separatorPosition; i++)
            {
                if (CODE_ALPHABET.IndexOf(code[i]) == -1 && code[i] != PADDING_CHARACTER)
                {
                    // Invalid character.
                    return false;
                }
                if (paddingStarted)
                {
                    // Once padding starts, there must not be anything but padding.
                    if (code[i] != PADDING_CHARACTER)
                    {
                        return false;
                    }
                }
                else if (code[i] == PADDING_CHARACTER)
                {
                    paddingStarted = true;
                    // Short codes cannot have padding
                    if (separatorPosition < SEPARATOR_POSITION)
                    {
                        return false;
                    }
                    // Padding can start on even character: 2, 4 or 6.
                    if (i != 2 && i != 4 && i != 6)
                    {
                        return false;
                    }
                }
            }

            // Check the characters after the separator.
            if (code.Length > separatorPosition + 1)
            {
                if (paddingStarted)
                {
                    return false;
                }
                // Only one character after separator is forbidden.
                if (code.Length == separatorPosition + 2)
                {
                    return false;
                }
                for (int i = separatorPosition + 1; i < code.Length; i++)
                {
                    if (!CODE_ALPHABET.Contains(code[i]))
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        private static bool IsValidBloomsburgCode(string code)
        {
            int count = 0;
            for (int i = 0; i < code.Length; i++)
            {
                if (CODE_ALPHABET.Contains(code[i]))
                {
                    count++;
                }
            }

            return count == 7;
        }





        /// <summary>
        /// Checks whether the given code is a full Open Location Code.
        /// </summary>
        /// <param name="code">The code to check.</param>
        /// <returns>True if the code is full, otherwise false.</returns>
        public static bool IsFull(string code)
        {
            return new OpenLocationCode(code).IsFull();
        }

        private bool IsFull()
        {
            return _code.IndexOf(SEPARATOR) == SEPARATOR_POSITION;
        }

        /// <summary>
        ///Compute the latitude precision value for a given code length. Lengths <= 10 have the same
        /// precision for latitude and longitude, but lengths > 10 have different precisions due to the
        /// grid method having fewer columns than rows. Copied from the JS implementation.        /// </summary>
        /// <param name="codeLength">The length of the code</param>
        /// <returns>The latitude precision</returns>
        private static double ComputeLatitudePrecision(int codeLength)
        {
            if (codeLength <= CODE_PRECISION_NORMAL)
            {
                return Math.Pow(ENCODING_BASE, (double)(codeLength / -2 + 2));
            }
            return Math.Pow(ENCODING_BASE, -3) / Math.Pow(GRID_ROWS, codeLength - PAIR_CODE_LENGTH);
        }

    }

    /// <summary>
    /// Represents a geographic coordinate with latitude and longitude.
    /// </summary>
    public class Coordinate
    {
        private readonly double _latitude;
        private readonly double _longitude;
        private static readonly int _RADIUS_OF_EARTH_IN_MILES = 3956;

        public enum DistanceMetric
        {
            Miles,
            Feet,
            Kilometers,
            Meters
        }

        static Dictionary<DistanceMetric, float> distanceConversion = GetDistanceConversion();

        private static Dictionary<DistanceMetric, float> GetDistanceConversion()
        {
            Dictionary<DistanceMetric, float> d = [];
            d.Add(DistanceMetric.Miles, 1);
            d.Add(DistanceMetric.Feet, 5280);
            d.Add(DistanceMetric.Kilometers, (float)1.60934);
            d.Add(DistanceMetric.Meters, (float)1609.34);

            return d;
        }

        public static double ConvertDistanceUnits(DistanceMetric startMetric, DistanceMetric goalMetric, double distanceInStartingMetric) {
            double inMiles = distanceInStartingMetric / distanceConversion[startMetric];
            return inMiles * distanceConversion[goalMetric];
        }

        /// <summary>
        /// Initializes a Coordinate object with latitude and longitude in decimal degrees.
        /// </summary>
        /// <param name="latitude">The latitude of the coordinate.</param>
        /// <param name="longitude">The longitude of the coordinate.</param>
        public Coordinate(double latitude, double longitude)
        {
            _latitude = latitude;
            _longitude = longitude;
        }


        /// <summary>
        /// Initializes a Coordinate object with latitude and longitude, divided into degrees, minutes,
        /// and seconds.
        /// </summary>
        /// <param name="latDegrees">The latitudinal degrees of the coordinate.</param>
        /// <param name="lngDegrees">The longitudinal degrees of the coordinate.</param>
        /// <param name="latMinutes">The latitudinal minutes of the coordinate.</param>
        /// <param name="lngMinutes">The longitudinal minutes of the coordinate.</param>
        public Coordinate(double latDegrees, double latMinutes, double latSeconds, double lngDegrees, double lngMinutes, double lngSeconds)
        {
            _latitude = DegMinSecToDegrees(latDegrees, latMinutes, latSeconds);
            _longitude = DegMinSecToDegrees(lngDegrees, lngMinutes, lngSeconds);
        }
        


        /// <summary>
        /// Initializes a Coordinate object located on Bloomsburg campus, identifiable with only
        ///  minutes, and seconds.
        /// </summary>

        /// <param name="latMinutes">The latitudinal minutes of the coordinate.</param>
        /// <param name="lngMinutes">The longitudinal minutes of the coordinate.</param>
        /// <param name="latSeconds">The latitudinal seconds of the coordinate.</param>
        /// <param name="lngSeconds">The longitudinal seconds of the coordinate.</param>
        public static Coordinate GetBloomsburgCoordinates(double latMinutes, double latSeconds, double lngMinutes, double lngSeconds)
        {
            return new Coordinate(CAMPUS_LAT_DEGREES, latMinutes, latSeconds, CAMPUS_LNG_DEGREES, lngMinutes, lngSeconds);
        }


        private static double DegMinSecToDegrees(double degrees, double minutes, double seconds)
        {
            return degrees + minutes / 60 + seconds / 3600;
        }

        private static double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }

        /// <summary>
        /// Returns the distance between two coordinates in the supplied unit.
        /// </summary>
        /// <param name="c1">The first latitude/longitude coordinate</param>
        /// <param name="c2">The second latitude/longitude coordinate</param>
        /// <param name="metric">The unit of distance (DistanceMetric.Mile, DistanceMetric.Feet, 
        //  DistanceMetric.Meter, DistanceMetric.Kilometer)</param>
        /// <returns>The distance between two coordinates in the supplied unit</returns>

        public static double GetDistance(Coordinate c1, Coordinate c2, DistanceMetric metric)
        {
            double deltaLng = DegreesToRadians(c1._longitude) - DegreesToRadians(c2._longitude);
            double deltaLat = DegreesToRadians(c1._latitude) - DegreesToRadians(c2._latitude);

            double a = Math.Pow(Math.Sin(deltaLat / 2), 2) + Math.Cos(c1._latitude) * Math.Cos(c2._latitude) * Math.Pow(Math.Sin(deltaLng / 2), 2);

            return _RADIUS_OF_EARTH_IN_MILES * distanceConversion[metric] * Math.Asin(Math.Sqrt(a));
        }
        /// <summary>
        /// Returns the distance between two coordinates in the default unit (feet).
        /// </summary>
        /// <param name="c1">The first latitude/longitude coordinate</param>
        /// <param name="c2">The second latitude/longitude coordinate</param>
        //  DistanceMetric.Meter, DistanceMetric.Kilometer)</param>
        /// <returns>The distance between two coordinates in feet</returns>
        public static double GetDistance(Coordinate c1, Coordinate c2)
        {
            return GetDistance(c1, c2, DistanceMetric.Feet);
        }

        public double GetLatitude()
        {
            return _latitude;
        }

        public double GetLongitude()
        {
            return _longitude;
        }
    }



    /// <summary>
    /// Represents a rectangular area defined by latitude and longitude bounding coordinates.

    /// Initializes a new CodeArea object with the provided bounding coordinates.
    /// </summary>
    /// <param name="southLatitude">The southernmost latitude of the bounding box.</param>
    /// <param name="westLongitude">The westernmost longitude of the bounding box.</param>
    /// <param name="northLatitude">The northernmost latitude of the bounding box.</param>
    /// <param name="eastLongitude">The easternmost longitude of the bounding box.</param>
    /// <param name="length">The length of the Open Location Code.</param>
    public class CodeArea(
        double southLatitude,
        double westLongitude,
        double northLatitude,
        double eastLongitude,
        int length)
    {

        private readonly double _southLatitude = southLatitude;
        private readonly double _westLongitude = westLongitude;
        private readonly double _northLatitude = northLatitude;
        private readonly double _eastLongitude = eastLongitude;
        private readonly int _length = length;

        public double GetSouthLatitude()
        {
            return _southLatitude;
        }

        public double Get_WestLongitude()
        {
            return _westLongitude;
        }

        public double GetLatitudeHeight()
        {
            return _northLatitude - _southLatitude;
        }

        public double GetLongitudeWidth()
        {
            return _eastLongitude - _westLongitude;
        }
        /// <summary>
        /// Returns the vertical center of the bounding box
        /// </summary>
        /// <returns>The vertical center of the bounding box</returns>
        public double GetCenterLatitude()
        {
            return (_southLatitude + _northLatitude) / 2;
        }
        /// <summary>
        /// Returns the horizontal center of the bounding box
        /// </summary>
        /// <returns>The horizontal center of the bounding box</returns>
        public double GetCenterLongitude()
        {
            return (_westLongitude + _eastLongitude) / 2;
        }

        public double Get_NorthLatitude()
        {
            return _northLatitude;
        }

        public double Get_EastLongitude()
        {
            return _eastLongitude;
        }

        public int GetLength()
        {
            return _length;
        }
    }


    public static double GetDistance(Coordinate c1, Coordinate c2, Coordinate.DistanceMetric metric) {
        return Coordinate.GetDistance(c1, c2, metric);
    }

    public static double GetDistance(string openLocationCode1, string openLocationCode2, Coordinate.DistanceMetric metric) {
        return Coordinate.GetDistance(OpenLocationCode.DecodeToCenter(openLocationCode1), OpenLocationCode.DecodeToCenter(openLocationCode2), metric);
    }
    

    public static void ExampleUsage() {
        double latitude = 41.005471;
        double longitude = -76.447570;
        Coordinate coordinate = new(latitude, longitude);

        // Find the Plus code for the above coordinates ^^
        string plusCode = new OpenLocationCode(coordinate).GetCode();
        // equivalent to
        plusCode = OpenLocationCode.Encode(coordinate);

        // Sometimes latitude/longitude is given in the following format:
        // 41°03'37.9"N 76°47'08.7"W 
        // with degrees, minutes, and seconds

        Coordinate coordinateB = new(41, 03, 37.9, -76, -47, -8.7);
        // Note the negative signs - the longitude is given relative to WEST, so we need the negative 
        // signs. North and East are positive, South and West are negative.
        plusCode = OpenLocationCode.Encode(coordinateB);

        // The distance between two coordinates can be found
        double distance = Coordinate.GetDistance(coordinate, coordinateB, Coordinate.DistanceMetric.Miles);
        // where the last argument gives the units you want the distance returned in.
        // Miles, feet, meters, and kilometers are valid options.

        // Most (all) the points we're worried about are in Bloomsburg. For example, Ben Franklin Hall is
        // around 41°00'24.8"N 76°26'53.7"W

        string benFranklinCode = OpenLocationCode.EncodeInBloom(0, 24.8, -26, -53.7);
        // you can skip adding the degrees for lat/lng - the minutes and seconds are enough.

        // A Plus Code with 11 digits refers to (approximately) a 3x3 meter area. That is the default precision.
        // Given a plus code, you can get access to the rectangular bounds of that area.

        CodeArea codeArea = OpenLocationCode.Decode("87H52H42+WJF");
        codeArea.Get_EastLongitude();
        codeArea.Get_WestLongitude();
        // and so on
        // The latitude/longitude CENTER of that bounding box can be found - 
        codeArea.GetCenterLongitude();
        codeArea.GetCenterLatitude();
        // or, more directly -
        Coordinate center = OpenLocationCode.DecodeToCenter("87H52H42+WJF");
        // this is equivalent to
        center = new (codeArea.GetCenterLatitude(), codeArea.GetCenterLongitude());

        // since all Plus codes we'll be dealing with are in Bloom, they share the first 4 characters.

        codeArea = OpenLocationCode.DecodeBloom("2H42+WJF");
        center = OpenLocationCode.DecodeBloomToCenter("2H42+WJF");

        // The Bloomsburg location code prefix can be appended the granular code
        string fullCode = OpenLocationCode.AppendBloomPrefix("2H42+WJF").GetCode();
        // and then decoded
        center = OpenLocationCode.DecodeToCenter(fullCode);
        // or
        center = OpenLocationCode.AppendBloomPrefix("2H42+WJF").DecodeToCenter();

    }

    public static void TestDistanceFunction() {
        Coordinate c1 = new(41.005471, -76.449994);
        Coordinate c2 = new (41.006568, -76.447570);
        Console.WriteLine(Coordinate.GetDistance(c1, c2)); // should be around 400 feet

        c1 = new(41.084828, -76.863956); // should be around 14 miles
        Console.WriteLine(Coordinate.GetDistance(c1, c2, Coordinate.DistanceMetric.Miles));

    }

    public static void TestEncodeDecode() {
        string bloomCode = "2H52+4V2";
        Coordinate coordinate = OpenLocationCode.DecodeBloomToCenter(bloomCode);
        string re_encoded = OpenLocationCode.Encode(coordinate);
        Console.WriteLine();
        Console.WriteLine(bloomCode + " | " + re_encoded);
    }

    public static void TestBloomEncoding()
    {
        double[,] minSecLatLngPairs = { { 0, 19.4, -26, -58.8 } };
        string[] validEncodings = [OpenLocationCode.AppendBloomPrefix("2H42+544").GetCode()];

        for (int i = 0; i < minSecLatLngPairs.GetLength(0); i++)
        {
            string encoding = OpenLocationCode.EncodeInBloom(minSecLatLngPairs[i, 0], minSecLatLngPairs[i, 1], minSecLatLngPairs[i, 2], minSecLatLngPairs[i, 3]);
            string encodingB = OpenLocationCode.Encode(Coordinate.GetBloomsburgCoordinates(minSecLatLngPairs[i, 0], minSecLatLngPairs[i, 1], minSecLatLngPairs[i, 2], minSecLatLngPairs[i, 3]), 11);
            Console.Write(encoding + " | " + encodingB + " | " + validEncodings[i] + " | ");
            if (string.Compare(encoding, validEncodings[i]) == 0 && string.Compare(encoding, encodingB) == 0)
            {
                Console.Write("Pass\n");
            }
            else
            {
                Console.Write("Fail\n");
            }
        }
    }

    // 41°00'19.4"N 76°26'58.8"W


    public static void TestBasicEncoding()
    {
        double[,] latlngPairs = { { 41.011846, -76.444027, 10 }, { 41.011846, -76.444027, 11 } };
        string[] validEncodings = { "87H52H64+P9", "87H52H64+P9Q" };

        Console.WriteLine("\n");
        for (int i = 0; i < latlngPairs.GetLength(0); i++)
        {
            string encoding = OpenLocationCode.Encode(latlngPairs[i, 0], latlngPairs[i, 1], (int)latlngPairs[i, 2]);
            Console.Write(encoding + " | " + validEncodings[i] + " | ");
            if (string.Compare(encoding, validEncodings[i]) == 0)
            {
                Console.Write("Pass\n");
            }
            else
            {
                Console.Write("Fail\n");
            }
        }
    }

    // public static void Main() {
    //     Console.WriteLine("Test");
    // }

}

