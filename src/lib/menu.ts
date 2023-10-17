import { base } from "$app/paths";

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
    url: `${base}/problems`,
    title: "Problem Tracker",
  },
  {
    url: "",
    title: "Tools",
    children: [
      {
        url: "/",
        title: "Link 1",
      },
      {
        url: "/",
        title: "Link 2",
      },
      {
        url: "/",
        title: "Link 3",
      },
    ],
  },
  {
    url: `${base}/mempool`,
    title: "Mempool",
  },
];

export default menu;
