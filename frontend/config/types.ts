export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  badge?: {
    text: string;
    color?: string;
  };
  bulge?: {
    text: string;
    color?: string;
  };
  translate?: string;
  bold?: boolean;
  fontIcon?: string;
  svgIcon?: string;
  path?: string;
  page?: string;
  newTab?: boolean;
  children?: MenuItem[];
  routeParams?: Record<string, string>;
}
