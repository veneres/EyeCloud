export class Station {
  name: string;
  stimuli: string[];
  complexity: number;
  height: number;
  width: number;
  description: string;

  constructor(name: string, stimuli: string[], complexity: number, height: number, width: number, description: string) {
    this.name = name;
    this.stimuli = stimuli;
    this.complexity = complexity;
    this.height = height;
    this.width = width;
    this.description = description;
  }

}
