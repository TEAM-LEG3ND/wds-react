import { ReactNode, useEffect, useRef, useState } from "react";

import { getMyPositionAsync } from "@/effects/geolocation";
import { MapProvider } from "@/features/map/MapProvider";
import useAbortController from "@/hooks/use-abort-controller";
import { TBoundary } from "@/models/map";
import { TPosition } from "@/models/spot";
import { Spinner } from "@/ui/loader";
import Toast from "@/ui/toast";
import { setMyPositionCache } from "@/utils";

import classNames from "./Map.module.css";

interface MapProps {
  initialPosition: TPosition;
  onInit: (map: kakao.maps.Map) => void;
  onChangeBounds: (boundary: TBoundary) => void;
  children?: ReactNode;
  className: string;
}

function Map({
  initialPosition,
  children,
  className,
  onInit,
  onChangeBounds,
}: MapProps) {
  const { kakaoMap, containerRef } = useKakaoMap(initialPosition);
  const { abort, abortify, reset: resetAbort } = useAbortController();
  const [isLoading, setIsLoading] = useState(false);
  const onInitializeRef = useRef(onInit);

  useEffect(() => {
    if (!kakaoMap) return;

    const getMyPosition = async () => {
      try {
        setIsLoading(true);
        const myPosition = await abortify(getMyPositionAsync)({
          timeout: 10000,
        });

        kakaoMap.setCenter(
          new kakao.maps.LatLng(myPosition.latitude, myPosition.longitude)
        );
        setMyPositionCache(myPosition);
        onInitializeRef.current && onInitializeRef.current(kakaoMap);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        resetAbort();
      }
    };
    getMyPosition();
  }, [kakaoMap, abortify, resetAbort]);

  useEffect(() => {
    if (!kakaoMap) return;

    const changeBoundsListener = () => {
      const bounds = kakaoMap.getBounds();
      const swLatLng = bounds.getSouthWest();
      const neLatLng = bounds.getNorthEast();
      const boundary: TBoundary = {
        swlat: swLatLng.getLat(),
        swlng: swLatLng.getLng(),
        nelat: neLatLng.getLat(),
        nelng: neLatLng.getLng(),
      };

      onChangeBounds(boundary);
      abort("Abort getMyPosition:User interaction occured");
    };

    kakao.maps.event.addListener(kakaoMap, "idle", changeBoundsListener);

    return () => {
      kakao.maps.event.removeListener(kakaoMap, "idle", changeBoundsListener);
    };
  }, [kakaoMap, onChangeBounds, abort]);

  return (
    <div ref={containerRef} className={className}>
      <MapProvider map={kakaoMap}>
        {children}
        <Toast
          visible={isLoading}
          content={
            <div className={classNames.current_position_loader}>
              <Spinner /> 현재 위치를 불러오는 중입니다...
            </div>
          }
        />
      </MapProvider>
    </div>
  );
}

const useKakaoMap = (initialPosition: TPosition) => {
  const kakaoMapRef = useRef<kakao.maps.Map | null>(null);

  const mapContainerRefCallback = (node: HTMLDivElement | null) => {
    if (!node || kakaoMapRef.current) return;

    const map = new kakao.maps.Map(node, {
      center: new kakao.maps.LatLng(
        initialPosition.latitude,
        initialPosition.longitude
      ),
      level: 4,
      draggable: true,
    });
    kakaoMapRef.current = map;
  };

  return {
    kakaoMap: kakaoMapRef.current,
    containerRef: mapContainerRefCallback,
  };
};

export default Map;
