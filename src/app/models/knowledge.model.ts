import { ApplicationDb } from '../application.db';

export class Knowledge extends ApplicationDb {
  public id: number;
  public slug: string;
  public filters: string;
  public category: string;
  public placeholder: string;
  public name: string;
  public description: string;
  public knowledgeBase_id: number;
  public updated_at: Date;
  public created_at: Date;

  constructor() {
    super(201911191636, 'knowledge');
  }

  /**
   * List all Knowledge by base id
   * @param piaId - The PIA id
   */
  async findAllByBaseId(baseId: number) {
    const items = [];
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl(), {
          mode: 'cors'
        })
          .then(response => {
            return response.json();
          })
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            console.error('Request failed', error);
            reject();
          });
      } else {
        this.getObjectStore().then(() => {
          const index1 = this.objectStore.index('index1');
          const evt = index1.openCursor(IDBKeyRange.only(baseId));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          };
        });
      }
    });
  }

  /**
   * Create a new Knowledge ENTRY.
   * @returns - New Promise
   */
  async create(baseId) {
    const data = {
      slug: this.slug,
      filters: this.filters,
      category: this.category,
      placeholder: this.placeholder,
      name: this.name,
      description: this.description,
      knowledgeBase_id: baseId,
      created_at: new Date(),
      updated_at: new Date()
    };

    this.created_at = data.created_at;
    this.updated_at = data.updated_at;

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

  // async update() {
  //   return new Promise((resolve, reject) => {
  //     this.find(this.id).then((entry: any) => {
  //       entry.name = this.name;
  //       entry.author = this.author;
  //       entry.contributors = this.contributors;
  //       entry.updated_at = new Date();

  //       if (this.serverUrl) {
  //         const formData = new FormData();
  //         for (const d in entry) {
  //           if (entry.hasOwnProperty(d)) {
  //             let value = entry[d];
  //             if (d === 'data') {
  //               value = JSON.stringify(value);
  //             }
  //             formData.append('structure[' + d + ']', value);
  //           }
  //         }
  //         fetch(this.getServerUrl() + '/' + entry.id, {
  //           method: 'PATCH',
  //           body: formData,
  //           mode: 'cors'
  //         })
  //           .then(response => {
  //             return response.json();
  //           })
  //           .then((result: any) => {
  //             resolve();
  //           })
  //           .catch(error => {
  //             console.error('Request failed', error);
  //             reject();
  //           });
  //       } else {
  //         this.getObjectStore().then(() => {
  //           const evt = this.objectStore.put(entry);
  //           evt.onerror = (event: any) => {
  //             console.error(event);
  //             reject(Error(event));
  //           };
  //           evt.onsuccess = () => {
  //             resolve();
  //           };
  //         });
  //       }
  //     });
  //   });
  // }
}
