import type { Category, Project } from './types';

type Row = [string, Category, number, string, boolean];

const build = (
  id: number,
  character: string,
  series: string,
  event: string,
  targetBudget: number,
  hours: number,
  rows: Row[]
): Project => ({
  id,
  character,
  series,
  event,
  targetBudget,
  hours,
  items: rows.map(([name, category, cost, notes, done], i) => ({
    id: id * 100 + i + 1,
    projectId: id,
    name,
    category,
    cost,
    notes,
    done,
  })),
});

export const seedProjects = (): Project[] => [
  build(1, 'Frieren', 'Sousou no Frieren', 'Kamen Con 2026', 280, 22, [
    ['White mage coat (cotton twill)', 'sewing', 48, 'About 3 yards, cream white', true],
    ['Black tights & undershirt', 'sewing', 22, '', true],
    ['Gold trim & braid', 'sewing', 18.5, 'Metallic, 5 yards', false],
    ['Long silver-white wig', 'wig', 62, 'Heat resistant, 100cm twin tails', true],
    ['Pointed elf ear tips', 'accessories', 14, 'Prosthetic, spirit gum needed', false],
    ['Staff (Mage staff)', 'props', 55, 'PVC pipe + EVA foam + paint', false],
    ['Earrings (tassel)', 'accessories', 9, '', false],
    ['Boots (brown, ankle)', 'accessories', 38, 'Thrift or paint-over', false],
  ]),
  build(2, '2B', 'NieR:Automata', 'Connecturday 2026', 420, 41, [
    ['Black gothic dress (stretch satin)', 'sewing', 70, 'Corset-style bodice', true],
    ['White bob wig', 'wig', 38, 'Pre-styled, side-swept bangs', true],
    ['Black blindfold / visor', 'accessories', 12, '', true],
    ['Virtuous Contract sword', 'props', 85, 'EVA foam + Worbla edges', false],
    ['Thigh-high boots', 'accessories', 64, 'Heels, black patent', false],
    ['Pod 042 prop', 'props', 40, '3D print + paint', false],
    ['Shoulder pauldrons', 'props', 30, 'Foam armor', false],
    ['Black gloves', 'accessories', 11, '', false],
  ]),
];
