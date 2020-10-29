import { Knowledge } from './knowledge.model';

export class KnowledgeBase{
  public id: number;
  public name: string;
  public author: string;
  public contributors: string;
  public knowledges: Knowledge[] = [];
  public created_at: Date;
  public is_example = false;

  constructor(id = null, name = null, author = null, contributors = null, createdAt = null) {
    if (id !== null) {
      this.id = id;
    }
    this.name = name;
    this.author = author;
    this.contributors = contributors;
    this.created_at = createdAt;
  }

}
