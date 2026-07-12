/**
 * Registro del add-on Media Player en AkoeNet.
 * Copiar a: apps/akoenet/Client/src/modules/media-player/index.jsx
 */
import { lazy } from "react";

export const MEDIA_PLAYER_ADDON = {
  id: "media-player",
  name: "Dakinis Media Player",
  description: "Reproductor retro con playlists, EQ y escuchar juntos",
  version: "0.1.0",
  route: "/media",
  icon: "🎵",
  permissions: ["media:play", "media:library", "media:rooms"],
};

const MediaPlayerRoot = lazy(() => import("./MediaPlayerRoot.jsx"));

export function registerMediaPlayer(routes) {
  routes.push({
    path: MEDIA_PLAYER_ADDON.route,
    element: <MediaPlayerRoot />,
    meta: { addon: MEDIA_PLAYER_ADDON.id },
  });
}

export default MediaPlayerRoot;
