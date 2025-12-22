import { IconType } from "react-icons";
import {
  FaSpotify,
  FaApple,
  FaDeezer,
  FaYoutube,
  FaSoundcloud,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";
import { SiTidal } from "react-icons/si";

export interface Platform {
  name: string;
  icon: IconType;
  href: string;
  ariaLabel: string;
}

export interface Social {
  name: string;
  icon: IconType;
  href: string;
  ariaLabel: string;
}

export const streamingPlatforms: Platform[] = [
  {
    name: "Spotify",
    icon: FaSpotify,
    href: "https://open.spotify.com/artist/3LAoxEz5BGdijXj4YG2f6v?ref=nillihc",
    ariaLabel: "Luister Nillihc op Spotify",
  },
  {
    name: "Apple Music",
    icon: FaApple,
    href: "https://music.apple.com/nl/artist/nillihc/1370500346?l=en-GB&ref=nillihc",
    ariaLabel: "Luister Nillihc op Apple Music",
  },
  {
    name: "YouTube Music",
    icon: FaYoutube,
    href: "https://music.youtube.com/channel/UC8n_eOr5TCV3JVsUfqMqiqw?ref=nillihc",
    ariaLabel: "Luister Nillihc op YouTube Music",
  },
  {
    name: "Deezer",
    icon: FaDeezer,
    href: "https://www.deezer.com/us/artist/14527457?ref=nillihc",
    ariaLabel: "Luister Nillihc op Deezer",
  },
  {
    name: "Tidal",
    icon: SiTidal,
    href: "https://tidal.com/artist/9736733?ref=nillihc",
    ariaLabel: "Luister Nillihc op Tidal",
  },
  {
    name: "SoundCloud",
    icon: FaSoundcloud,
    href: "https://soundcloud.com/nillihc-band?ref=nillihc",
    ariaLabel: "Luister Nillihc op SoundCloud",
  },
];

export const socials: Social[] = [
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "https://www.instagram.com/nillihcband?ref=nillihc",
    ariaLabel: "Volg Nillihc op Instagram",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    href: "https://www.facebook.com/nillihcband?ref=nillihc",
    ariaLabel: "Volg Nillihc op Facebook",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    href: "https://www.youtube.com/@nillihcband?ref=nillihc",
    ariaLabel: "Bekijk Nillihc op YouTube",
  },
];

