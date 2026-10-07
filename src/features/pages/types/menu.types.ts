export interface MenuItem {
  name: string;
  description?: string;
  price?: number;
  isAvailable: boolean;
}

export interface MenuSection {
  name: string;
  items: MenuItem[];
}

export interface ApiMenu {
  _id: string;
  page: string;
  sections: MenuSection[];
}
