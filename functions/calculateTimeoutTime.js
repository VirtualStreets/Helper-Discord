module.exports = async (lastViolations, severity) => {
    let violationPoint = 0
    for (let violation of lastViolations) {
        switch (violation.severity) {
            case 1:
                violationPoint += 1
                break
            case 2:
                violationPoint += 3
                break
            case 3:
                violationPoint += 5
                break
            case 4:
                violationPoint += 10
                break
        }
    }
    console.log(violationPoint)
    if (violationPoint >= 30 || severity === 5) return -1
    if ((violationPoint < 5 && severity <= 2) || (violationPoint < 8 && severity <= 1)) return 0

    let hoursOfTimeout = 0

    switch (severity) {
        case "1":
            hoursOfTimeout += Math.round(violationPoint * 0.75)
            break
        case "2":
            hoursOfTimeout += Math.round(violationPoint)
            break
        case "3":
            hoursOfTimeout += 3 + Math.round(violationPoint * 1.75)
            break
        case "4":
            hoursOfTimeout = 48 + Math.round(violationPoint * 3)
            break
    }
    return hoursOfTimeout
}
