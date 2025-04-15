namespace CampusMapApi {
    public class PathNodeDto {
        public float latitude { get; set; }
        public float longitude {get; set; }
        public float floor { get; set; }
        public string building { get; set; } = string.Empty;
        public string id { get; set; } = string.Empty;
    }
}