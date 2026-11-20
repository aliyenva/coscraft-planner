export type Category = 'sewing' | 'wig' | 'props' | 'accessories';

export const CATEGORY_LABELS: Record<Category, string> = {
  sewing: 'Sewing',
  wig: 'Wig',
  props: 'Props & Armor',
  accessories: 'Accessories',
};

export interface Item {
  id: number;
  projectId: number;
  name: string;
  category: Category;
  cost: number;
  notes: string;
  done: boolean;
}

export interface Project {
  id: number;
  character: string;
  series: string;
  event: string;
  targetBudget: number;
  hours: number;
  items: Item[];
}

export interface NewProject {
  character: string;
  series: string;
  event: string;
  targetBudget: number;
  hours: number;
}

export interface NewItem {
  name: string;
  category: Category;
  cost: number;
  notes: string;
}

export const stats = (p: Project) => {
  const total = p.items.length;
  const done = p.items.filter((i) => i.done).length;
  const spent = p.items.filter((i) => i.done).reduce((s, i) => s + i.cost, 0);
  return {
    total,
    done,
    spent,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    remaining: p.targetBudget - spent,
    over: spent > p.targetBudget,
  };
};

export const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
