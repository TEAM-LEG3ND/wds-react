import { useEffect, useState } from "react";

import classNames from "@/ui/CurrentPositionOverlay.module.css";
import { useMap } from "@/ui/MapProvider";
import { useGeolocationWatcher } from "@/effects/geolocation";
import { TPosition } from "@/types/models";

interface Props {
  defaultPos: TPosition;
}

export default function CurrentPositionOverlay({ defaultPos }: Props) {
  const map = useMap();
  const { currentPosition } = useGeolocationWatcher(defaultPos);
  const [overlay, setOverlay] = useState<kakao.maps.CustomOverlay | null>(null);

  useEffect(() => {
    if (!map) return;
    const content = `<div class=${classNames.overlay} />`;

    const currentPositionOverlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(
        defaultPos.latitude,
        defaultPos.longitude
      ),
      content: content,
      clickable: false,
      zIndex: 1,
    });

    setOverlay(currentPositionOverlay);
    currentPositionOverlay.setMap(map);
  }, [defaultPos.latitude, defaultPos.longitude, map]);

  useEffect(() => {
    if (!overlay) return;

    overlay.setPosition(
      new kakao.maps.LatLng(currentPosition.latitude, currentPosition.longitude)
    );
  }, [overlay, currentPosition.latitude, currentPosition.longitude]);

  return null;
}
