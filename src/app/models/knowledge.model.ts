export class Knowledge {
  public id: number;
  public slug: string;
  public filters: string;
  public category: string;
  public placeholder: string;
  public name: string;
  public description: string;
  public knowledge_base_id: number;
  public items: any[] = [];
  public lock_version: number;
  public updated_at: Date;
  public created_at: Date;
}
