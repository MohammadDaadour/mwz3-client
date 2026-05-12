export interface IAdsResult {
  count: number;
  rows: IAd[];
}

export interface IAuthResponse {
  success: boolean;
  status: number;
  meta: any;
}

export type HeaderProps = {
  headerLabels: {
    btnLogin: string;
    btnSell: string;
    btnSearch: string;
    regions: string[];
    lblRegion: string;
    lblLang: string;
  };
  drawerLabels: {
    btnProfile: string;
    btnAds: string;
    btnFavs: string;
    btnMessages: string;
    btnSubs: string;
    btnLogout: string;
    btnBanners: string;
    btnAreas: string;
    btnCategories: string;
    btnSubsTypes: string;
    btnUsers: string;
    btnUsersAds: string;
  };
  drawerData: GlobalMenuProps;
  auth: {
    success: boolean;
    user: {
      id: number;
      role: string;
      name: string;
      image: number;
    };
  };
};

export type FooterProps = {
  data: { label: string; links: { label: string; link: string }[] }[];
  misc: { rights: string; slang: string };
};

export type GlobalMenuProps = {
  data: {
    order: number;
    label: string;
    link: string;
    icon: string;
    subs: { order: number; label: string; link: string }[];
  }[];
  misc: {
    btnViewAll: string;
    ctgMisc: string;
  };
  clickFn?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

export type LimitedCtgGridData = {
  order: number;
  label: string;
  link: string;
  icon: string;
  subs: { label: string; link: string }[];
}[];

export type AreaFilterProps = {
  areas: {
    value: string;
    label: string;
    parent: string;
    level: number;
  }[];
  labels: {
    setArea: string;
    lblCountry: string;
    lblGovernorate: string;
    lblProvience: string;
    lblEmirate: string;
    lblCity: string;
    lblDistrict: string;
  };
};

export type CategoryFilterProps = {
  categories: {
    value: string;
    label: string;
    parent: string;
    level: number;
  }[];
  labels: {
    setCtg: string;
    lblMainCtg: string;
    lblSubCtg: string;
  };
};

export type SearchQueryProps = {
  labels: {
    setSearch: string;
    lblPlaceholder: string;
  };
};

export type TypeFilterProps = {
  labels: {
    setType: string;
    lblBoosted: string;
    lblCertified: string;
  };
};

export type SearchResultsProps = {
  locale: string;
  labels: {
    setResults: string;
    adCert: string;
    adSpecial: string;
  };
};

export interface IAd {
  id: number;
  label: string;
  value: number;
  currency: string;
  description: string;
  image: number;
  details: string;
  boosted: boolean;
  boost_request: boolean;
  notes: string;
  visits: number;
  activatedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  user: IUser;
  userFK: number;
  category: ICategory;
  categoryFK: number;
  categoryLbl: string;
  area: IArea;
  areaFK: number;
  areaLbl?: string;
  state: IState;
  stateFK: number;
  boost_plan: string;
  boost_end: string;
}

export interface IArea {
  id: number;
  level: number;
  parent: number;
  labelEn: string;
  labelAr: string;
}

export interface ICategory {
  id: number;
  level: number;
  parent: number;
  labelEn: string;
  labelAr: string;
  icon: string;
  order: number;
  promote: boolean;
  createdAt: string;
  deletedAt: string;
}

export interface IImage {
  id: number;
  scope: string;
  ref: string;
  mime: string;
}

export interface IState {
  id: number;
  labelEn: string;
  labelAr: string;
}

export interface ISub {
  id: number;
  active: boolean;
  activatedAt: string;
  createdAt: string;
  endsAt: string;
  user: IUser;
  userFK: number;
  subType: ISubType;
  subTypeFK: number;
}

export interface ISubType {
  id: number;
  type: string;
  duration: number;
  value: number;
  currency: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  active: boolean;
  createdAt: string;
  deletedAt: string;
  area: IArea;
  areaFK: number;
}

export interface IUser {
  id: number;
  email: string;
  label: string;
  image: number;
  certified: boolean;
  phone: string;
  counter: number;
  favs: number[];
  type: string;
  area: IArea;
  areaFK: number;
  activatedAt: string;
  createdAt: string;
  deletedAt: string;
  facebook: boolean;
  google: boolean;
}

export interface IRating {
  type: string;
  ref: number;
  value: number;
  userFK: number;
}

export interface IMessage {
  id: number;
  value: string;
  read: boolean;
  tx: number;
  sender: IUser;
  rx: number;
  receiver: IUser;
  createdAt: string;
}

export interface IComment {
  id: number;
  value: string;
  createdAt: string;
  user: IUser;
  userFK: number;
  ad: IAd;
  adFK: number;
}


export interface Comment {
  id: number;
  content: string;
  parentId: number | null;
  userId: number;
  user: {
    id: number;
    label: string;
    image: string | null;
    type: string
  };
  replies?: Comment[];
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  image: string | null;
  content: string;
  views: number;
  createdAt: string; // أو Date لو بتحولها
  updatedAt: string; // أو Date لو بتحولها
  deletedAt: string | null;
  user: any;
  comments: any;
}
