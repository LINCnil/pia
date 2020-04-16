export class Knowledge {
  public slug: string;
  public filters: string;
  public category: string;
  public placeholder: string;
  public name: string;
  public description: string;

  constructor(slug, filters, category, placeholder, name, description) {
    this.slug = slug;
    this.filters = filters;
    this.category = category;
    this.placeholder = placeholder;
    this.name = name;
    this.description = description;
  }
}
