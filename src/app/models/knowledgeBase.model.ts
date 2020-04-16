import { ApplicationDb } from '../application.db';
import { Knowledge } from './knowledge.model';

export class KnowledgeBase extends ApplicationDb {
  public id: number;
  public name: string;
  public author: string;
  public contributors: string;
  public knowleges: Knowledge[] = [];

  constructor() {
    super(201911191636, 'knowledgeBase');
    this.created_at = new Date();
  }

  /**
   * Get a Revision.
   * @param id - The Revision id.
   * @returns - New Promise
   */
  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        if (entry) {
          this.knowleges = entry.knowleges;
          this.created_at = new Date(entry.created_at);
        }
        resolve();
      });
    });
  }

  /**
   * Create a new Structure.
   * @returns - New Promise
   */
  async create() {
    const data = {
      knowleges: this.knowleges,
      created_at: new Date()
    };
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.add(data);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            resolve({ ...this, id: event.target.result });
          };
        });
      }
    });
  }
}
