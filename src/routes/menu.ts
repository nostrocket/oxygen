import { base } from "$app/paths";

interface INavigationLink {
  url: string;
  title: string;
  children?: INavigationLink[];
}

const menu: INavigationLink[] = [
  {
    url: `${base}/`,
    title: "About",
  },
  {
    url: `${base}/identity`,
    title: "People",
  },
  {
    url: `${base}/rockets`,
    title: "Rockets",
  },
  {
    url: `${base}/problems`,
    title: "Problem Tracker",
  },
  {
    url: `${base}/consensustip`,
    title: "Tools",
  },
  {
    url: `${base}/merits`,
    title: "Merits",
  },
  {
    url: `${base}/nempool`,
    title: "Nempool",
  },
];

export default menu;
