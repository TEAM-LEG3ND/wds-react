import { useEffect, useRef } from "react";

import { useMap } from "@/components/MapProvider";
import { TGym } from "@/types/models";

interface Props {
  gym: TGym;
  onClick?: (gym: TGym) => void;
}

function GymMarker({ gym, onClick }: Props) {
  const map = useMap();
  const markerRef = useRef<kakao.maps.Marker>(
    new kakao.maps.Marker({
      position: new kakao.maps.LatLng(gym.latitude, gym.longitude),
      title: gym.name,
      clickable: true,
    })
  );
  const onClickRef = useRef(onClick);
  const gymRef = useRef(gym);

  useEffect(() => {
    markerRef.current.setMap(map);
    kakao.maps.event.addListener(
      markerRef.current,
      "click",
      () => onClickRef.current && onClickRef.current(gymRef.current)
    );
  }, [map]);

  return null;
}

export default GymMarker;