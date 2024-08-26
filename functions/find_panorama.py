import json
import sys
from streetlevel import streetview
from datetime import datetime

def find_latest_panorama(panoramas):
    latest_pano = None
    for pano in panoramas:
        if latest_pano is None or datetime.strptime(str(pano.date), "%Y-%m") > datetime.strptime(str(latest_pano.date), "%Y-%m"):
            latest_pano = pano
    return latest_pano

def main():
    lat, lng = map(float, sys.argv[1:3])
    pano = streetview.find_panorama(lat, lng, search_third_party=False)

    if not pano.historical:
        latest_pano = pano
    else:
        latest_pano = find_latest_panorama(pano.historical)
        if latest_pano and (datetime.strptime(str(pano.date), "%Y-%m") > datetime.strptime(str(latest_pano.date), "%Y-%m")):
            latest_pano = pano


    pano_data = {
        "permalink": latest_pano.permalink().replace("!2e2", "!2e0").replace("!2e1", "!2e0").replace("!2e3", "!2e0").replace("!2e4", "!2e0").replace("!2e5", "!2e0").replace("!2e6", "!2e0").replace("!2e7", "!2e0").replace("!2e8", "!2e0").replace("!2e9", "!2e0"),
        "date": str(latest_pano.date)
    } if latest_pano else None

    print(json.dumps(pano_data))

if __name__ == "__main__":
    main()