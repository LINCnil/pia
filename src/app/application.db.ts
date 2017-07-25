export class ApplicationDb {
  protected dbVersion: number;
  protected db: any;
  protected tableName: string;
  protected objectStore: IDBObjectStore;

  constructor(dbVersion, tableName) {
    this.dbVersion = dbVersion;
    this.tableName = tableName;
  }

  async initDb() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.tableName, this.dbVersion);
      request.onerror = (event: any) => {
        console.error('Error');
      };
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      request.onupgradeneeded = (event: any) => {
        const objectStore = event.target.result.createObjectStore(this.tableName, { keyPath: "id", autoIncrement: true });
        // TODO need to be in comment.db.ts instead of this file
        if (this.tableName == 'pia') {
          objectStore.createIndex("name", "name", { unique: false });
          objectStore.createIndex("status", "status", { unique: false });
        } else if(this.tableName == 'comment') {
          objectStore.createIndex("pia_id", "pia_id", { unique: false });
          objectStore.createIndex("reference_to", "reference_to", { unique: false });
          objectStore.createIndex("type", "type", { unique: false });
        } else if(this.tableName == 'evaluation') {
          objectStore.createIndex("pia_id", "pia_id", { unique: false });
          objectStore.createIndex("reference_to", "reference_to", { unique: false });
          objectStore.createIndex("status", "status", { unique: false });
        } else if(this.tableName == 'answer') {
          objectStore.createIndex("pia_id", "pia_id", { unique: false });
          objectStore.createIndex("reference_to", "reference_to", { unique: false });
        } else if(this.tableName == 'measure') {
          objectStore.createIndex("pia_id", "pia_id", { unique: false });
        } else if(this.tableName == 'attachment') {
          objectStore.createIndex("pia_id", "pia_id", { unique: false });
        }
      };
    });
  }

  async getObjectStore() {
    this.db = await this.initDb();
    return new Promise((resolve, reject) => {
      this.objectStore = this.db.transaction(this.tableName, "readwrite").objectStore(this.tableName);
      resolve();
    });
  }

  async findAll() {
    let items = [];
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.openCursor().onsuccess = (event: any) => {
        let cursor = event.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        }
        resolve(items);
      }
    });
  }

  async find(id) {
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.get(id).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async delete(id) {
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.delete(id);
    });
  }
}
