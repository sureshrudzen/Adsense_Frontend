export interface Site {
  name: string;
  domain: string;
  state: string;
  accountId: string;
  userId?: string;
}

export interface SitesState {
  items: Site[];
  loading: boolean;
  error: string | null;
}
