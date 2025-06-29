class Utils {
    constructor() { }

    importMap() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';

            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) return reject(new Error('No file selected'));

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        resolve(data); // Resolve the promise with the parsed JSON data
                    } catch (err) {
                        reject(new Error('Invalid JSON file'));
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        });
    }

    exportMap(mapData, fileName) {
        const mapDataJSON = JSON.stringify(mapData, null, 2);
        const blob = new Blob([mapDataJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `${fileName}.json`;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
    }

    downloadMap(canvas, fileName) {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    getFarthestAngle(angleToPrev, angleToNext) {
        // Normalize angles to the range [-π, π]
        angleToPrev = ((angleToPrev + Math.PI) % (2 * Math.PI)) - Math.PI;
        angleToNext = ((angleToNext + Math.PI) % (2 * Math.PI)) - Math.PI;

        // Calculate the midpoint angle between the previous and next points
        let midpointAngle = (angleToPrev + angleToNext) / 2;

        // If the angles are on opposite sides of the circle, adjust the midpoint
        if (Math.abs(angleToNext - angleToPrev) > Math.PI) {
            midpointAngle += Math.PI;
        }

        // Normalize the midpoint angle to the range [-π, π]
        midpointAngle = ((midpointAngle + Math.PI) % (2 * Math.PI)) - Math.PI;

        // Add 180 degrees (π radians) to find the farthest angle
        const farthestAngle = midpointAngle + Math.PI;

        // Normalize the farthest angle to the range [-π, π]
        return ((farthestAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
    }

    getClosestDivisorTo90(number) {
        const divisors = [1, 2, 3, 5, 6, 9, 10, 15, 18, 30, 45, 90];
        let closest = divisors[0];
        let minDiff = Math.abs(number - closest);

        for (const d of divisors) {
            const diff = Math.abs(number - d);
            if (diff < minDiff) {
                closest = d;
                minDiff = diff;
            }
        }

        return closest;
    }

    getIntersectionWithLine(line, segment) {
        const { x: x1, y: y1, angle } = line;
        const { start, end } = segment;

        const x2 = x1 + Math.cos(angle); // Extend the bullseye line infinitely
        const y2 = y1 + Math.sin(angle);

        const x3 = start.x;
        const y3 = start.y;
        const x4 = end.x;
        const y4 = end.y;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return null; // Lines are parallel, no intersection

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        if (t >= 0 && u >= 0 && u <= 1) {
            // Intersection point is within the segment
            const intersectionX = x1 + t * (x2 - x1);
            const intersectionY = y1 + t * (y2 - y1);
            const intersectionAzimuth = Math.atan2(intersectionX, intersectionY);
            const intersectionDistance = Math.sqrt(intersectionX * intersectionX + intersectionY * intersectionY);

            return { x: intersectionX, y: intersectionY, azimuth: intersectionAzimuth < 0 ? intersectionAzimuth + (Math.PI * 2) : intersectionAzimuth, distance: intersectionDistance };
        }

        return null; // No valid intersection
    }

    getCenter(points) {
        if (points.length === 0) {
            return { x: 0, y: 0 };
        }

        let sumX = 0;
        let sumY = 0;

        // Sum up all x and y coordinates
        points.forEach((point) => {
            sumX += point.x;
            sumY += point.y;
        });

        // Calculate the average of x and y coordinates
        const centerX = sumX / points.length;
        const centerY = sumY / points.length;

        return { x: centerX, y: centerY };
    }

    isPointWithinArea(point, areaPoints) {
        if (areaPoints.length < 3) {
            // A polygon must have at least 3 points
            return false;
        }

        let isInside = false;
        const { x, y } = point;

        // Iterate through each edge of the polygon
        for (let i = 0, j = areaPoints.length - 1; i < areaPoints.length; j = i++) {
            const xi = areaPoints[i].x, yi = areaPoints[i].y;
            const xj = areaPoints[j].x, yj = areaPoints[j].y;

            // Check if the point is within the vertical bounds of the edge
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

            if (intersect) {
                isInside = !isInside;
            }
        }

        return isInside;
    }
}