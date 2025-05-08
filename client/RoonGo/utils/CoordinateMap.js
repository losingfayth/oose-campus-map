/*
    Extends the functionality of PointsNormalizer - allows for mapping points
    from any one (linear) coordinate system to another. Specifically for our
    use case:
    Client receives a list of LocationNode objects representing a Path. Suppose this
    Path begins inside Ben Franklin. When displaying the BenF. blueprint on the phone,
    we need some way to convert the latitude/longitude points (representing the location
    of each node on the path) to pixel values in the image or on the display of the
    users phone.

    Example - 
    The lat/lng coordinates of Ben Franklin are 
    (41.006672, -76.448275) - Top Left
    (41.007062, -76.448571) - Top Right
    (41.007152, -76.448383) - Bottom Left

    ^^ the orientation must match the orientation of the blueprint image.

    Let's say that the image of Ben Franklin is displayed on the user's phone
    as a 500 by 700 px image, and that the user's phone display has origin 0,0 
    in the top left corner.

    Then,

    let original = [ 
    41.006672, -76.448275,
    41.007062, -76.448571,
    41.007152, -76.448383,
    ]

    let changeTo = [
        0, 0,
        500, 0,
        0, 700,
    ]

    let map = new CoordinateMap(original, changeTo);

    Then, for each latitude/longitude pair received the corresponds to a LocationNode
    inside Ben Franklin, we can say

    let displayLocation = map.convert(latitude, longitude)
    And mark appropriate location as it appears on the phone at

    displayLocation.x, displayLocation.y
*/

class CoordinateMap {

    constructor(domainArray, rangeArray) {
       // console.log("Domain: tl: " + domainArray[0] + ", " + domainArray[1] + " | tR: " + domainArray[2] + ", " + domainArray[3] + ", bl: " + domainArray[4] + ", " + domainArray[5])
       // console.log("R: " + rangeArray[0] + ", " + rangeArray[1] + " | " + rangeArray[2] + ", " + rangeArray[3] + " | " + rangeArray[4] + ", " + rangeArray[5])
        this.domain = CoordinateSystem(Point(domainArray[0], domainArray[1]), Point(domainArray[2], domainArray[3]), Point(domainArray[4], domainArray[5]));
        this.range = CoordinateSystem(Point(rangeArray[0], rangeArray[1]), Point(rangeArray[2], rangeArray[3]), Point(rangeArray[4], rangeArray[5]));
    }

    static fromReference(reference) {
        return [reference.topLeft.latitude, reference.topLeft.longitude, reference.topRight.latitude, reference.topRight.longitude, reference.bottomLeft.latitude, reference.bottomLeft.longitude];
    }

    convert(x, y) {
        let point = Point(x, y);
        let proportionalityConstant = this.#getBasisProportion(this.domain, point);
        let scaled = this.#multVectorByMatrix(proportionalityConstant, [this.range.iHat.x, this.range.jHat.x, this.range.iHat.y, this.range.jHat.y]);

        return this.#vectorAddition(scaled, this.range.origin);
    }

    #getBasisProportion(coordinateSystem, point) {
        let wrtOrigin = vectorSubtraction(point, coordinateSystem.origin);

        let m = this.#multVectorByMatrix(wrtOrigin, coordinateSystem.inverseMatrix);

        return m;
    }



    #multVectorByMatrix(v, m) {

        return Point(v.x * m[0] + v.y * m[1], v.x * m[2] + v.y * m[3]);
    }

    #vectorAddition(v1, v2) {
        return Point(v1.x + v2.x, v1.y + v2.y);
    }

}

function CoordinateSystem(origin, topRight, bottomLeft) {
    let iHat = vectorSubtraction(topRight, origin);
    let jHat = vectorSubtraction(bottomLeft, origin);

    let determCoeff = iHat.x * jHat.y - iHat.y * jHat.x;
    let determ = 1 / determCoeff;
    let inverseMatrix = [jHat.y, -jHat.x, -iHat.y, iHat.x];
    inverseMatrix = scaleMatrix(determ, inverseMatrix);


    return {
        origin: origin,
        originPlusIHat: topRight,
        originPlusJHat: bottomLeft,
        iHat: iHat,
        jHat: jHat,
        inverseMatrix: inverseMatrix,
    }

}

function Point(x, y) {
    return {
        "x": x,
        "y": y,
    }
}

function vectorSubtraction(p1, p2) {

    return Point(p1.x - p2.x, p1.y - p2.y);
}

function scaleMatrix(scalar, matrix) {
    let m = [];
    for (let i = 0; i < matrix.length; i++) {
        m.push(matrix[i] * scalar);
    }

    return m;
}

export default CoordinateMap;
export { CoordinateSystem };
