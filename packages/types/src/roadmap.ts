export interface IRoadmap {
  id: string;
  name: string;
  url: string;
  color: string;
}

export interface IRoadmapPrivate extends IRoadmap {
  index: number;
  display: boolean;
}
