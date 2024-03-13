import { base } from "$app/paths";
import { rootProblem } from "../settings";

interface INavigationLink {
  url?: string;
  title: string;
  children?: INavigationLink[];
}

const menu: INavigationLink[] = [
  {
    url: `${base}/activity`,
    title: "Activity",
  },
  {
    url: `${base}/rockets`,
    title: "Rockets",
  },

  {
    url: `${base}/products`,
    title: "Products",
  },

  {
    url: `${base}/jobs`,
    title: "Jobs",
  },
  {
    url: `${base}/merits`,
    title: "Merits",
  },
  {
    title: "MORE",
    children: [
      {
        url: `${base}/theory`,
        title: "Theory",
      },
      {
        url: `${base}/identity`,
        title: "Web of Trust",
      },
      {
        url: `${base}/nr/Nostrocket/problems/${rootProblem}`,
        title: "Problem Tracker",
      },
      {
        url: `${base}/unprotocol`,
        title: "Unprotocol",
      },
      {
        url: `${base}/nempool`,
        title: "Nempool",
      },
      {
        url: `${base}/FAQ`,
        title: "FAQ",
      },
      {
        url: `${base}/funding`,
        title: "Funding Queue",
      },
    ]
  },
];

export default menu;
