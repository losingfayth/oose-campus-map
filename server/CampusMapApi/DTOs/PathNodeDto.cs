namespace CampusMapApi {
    public class PathNodeDto {
        public float Latitude { get; set; }
        public float Longitude {get; set; }
        public float Floor { get; set; }
        public string Building { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
    }
}