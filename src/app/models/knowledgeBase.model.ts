import { ApplicationDb } from '../application.db';
import { Knowledge } from './knowledge.model';

export class KnowledgeBase extends ApplicationDb {
  public id: number;
  public name: string;
  public author: string;
  public contributors: string;
  public knowledges: Knowledge[] = [];
  public created_at: Date;
  public is_example: Boolean = false;

  constructor(id = null, name = null, author = null, contributors = null, createdAt = null) {
    super(201911191636, 'knowledgeBase');
    this.id = id;
    this.name = name;
    this.author = author;
    this.contributors = contributors;
    this.created_at = createdAt;
  }

  /**
   * Get a KnowledgeBase.
   * @param id - The KnowledgeBase id.
   * @returns - New Promise
   */
  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id)
        .then((entry: any) => {
          if (entry) {
            this.name = entry.name;
            this.author = entry.author;
            this.contributors = entry.contributors;
            this.created_at = new Date(entry.created_at);
          }
          resolve();
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }

  /**
   * Create a new Structure.
   * @returns - New Promise
   */
  async create() {
    const data = {
      name: this.name,
      author: this.author,
      contributors: this.contributors,
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

  async update() {
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.name = this.name;
        entry.author = this.author;
        entry.contributors = this.contributors;
        entry.updated_at = new Date();

        if (this.serverUrl) {
          const formData = new FormData();
          for (const d in entry) {
            if (entry.hasOwnProperty(d)) {
              let value = entry[d];
              if (d === 'data') {
                value = JSON.stringify(value);
              }
              formData.append('structure[' + d + ']', value);
            }
          }
          fetch(this.getServerUrl() + '/' + entry.id, {
            method: 'PATCH',
            body: formData,
            mode: 'cors'
          })
            .then(response => {
              return response.json();
            })
            .then((result: any) => {
              resolve();
            })
            .catch(error => {
              console.error('Request failed', error);
              reject();
            });
        } else {
          this.getObjectStore().then(() => {
            const evt = this.objectStore.put(entry);
            evt.onerror = (event: any) => {
              console.error(event);
              reject(Error(event));
            };
            evt.onsuccess = () => {
              resolve();
            };
          });
        }
      });
    });
  }
}
