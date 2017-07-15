export class applicationDb {
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
        // TODO need to be in comment.db.ts instead of this file
        if (this.tableName == 'comment') {
          const objectStore = event.target.result.createObjectStore(this.tableName, { keyPath: "id", autoIncrement: true });
          objectStore.createIndex("reference_to", "reference_to", { unique: false });
          objectStore.createIndex("type", "type", { unique: false });
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
