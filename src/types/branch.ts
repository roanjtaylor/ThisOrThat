export interface FacetConfig {
  key: string; // a key in Item.facts, the literal "year", or "tags"
  label: string;
  source: 'fact' | 'tag';
  type: 'enum' | 'range';
  order?: string[];
  bucket?: { size: number; suffix?: string }; // range only, e.g. decade from year
}

export interface CardFact {
  key: string; // a key in Item.facts (or "year"/"maker"/"name")
  label: string;
  format?: 'number' | 'text';
  suffix?: string;
}

export type BranchStatus = 'draft' | 'curating' | 'ready';

export interface Branch {
  id: string;
  label: string;
  tagline: string;
  status: BranchStatus;
  itemNoun: { singular: string; plural: string };
  titleTemplate?: string; // default "${year} ${maker} ${name}"
  cardFacts: CardFact[];
  filterFacets: FacetConfig[];
}

export interface BranchRegistryEntry {
  id: string;
  label: string;
  tagline?: string;
  status: BranchStatus;
  itemCount: number;
}
