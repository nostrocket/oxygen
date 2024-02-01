import { base } from "$app/paths";
import { rootProblem } from "../settings";

interface INavigationLink {
  url: string;
  title: string;
  children?: INavigationLink[];
}

const menu: INavigationLink[] = [
  {
    url: `${base}/identity`,
    title: "People",
  },
  {
    url: `${base}/rockets`,
    title: "Rockets",
  },
  {
    url: `${base}/nr/Nostrocket/problems/${rootProblem}`,
    title: "Problem Tracker",
  },
  {
    url: `${base}/consensustip`,
    title: "Tools",
  },
  {
    url: `${base}/FAQ`,
    title: "FAQ",
  },
  {
    url: `${base}/nempool`,
    title: "Nempool",
  },
];

export default menu;
