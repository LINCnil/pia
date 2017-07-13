export class piaDb {
  private dbVersion: number;
  private piaTableName: string;
  private piaDb: any;

  constructor() {
    this.dbVersion = 201707071818;
    this.piaTableName = 'pia';
  }

  initPiaDb() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.piaTableName, this.dbVersion);
      request.onerror = (event: any) => {
        console.error('Error');
      };
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      request.onupgradeneeded = (event: any) => {
        const objectStore = event.target.result.createObjectStore(this.piaTableName, { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("status", "status", { unique: false });
      };
    });
  }

  async findAllPia() {
    this.piaDb = await this.initPiaDb();
    return new Promise((resolve, reject) => {
      const pia: any = this.piaDb.transaction(this.piaTableName, "readwrite").objectStore("pia");
      pia.getAll().onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  async findPia(id) {
    this.piaDb = await this.initPiaDb();
    return new Promise((resolve, reject) => {
      const pia: IDBObjectStore = this.piaDb.transaction(this.piaTableName, "readwrite").objectStore(this.piaTableName);
      pia.get(id).onsuccess = (event: any) => {
        console.log(event);
        resolve(event.target.result);
      };
    });
  }

  async createPia(name, author_name, evaluator_name, validator_name, creation_date) {
    this.piaDb = await this.initPiaDb();
    return new Promise((resolve, reject) => {
      const pia: IDBObjectStore = this.piaDb.transaction(this.piaTableName, "readwrite").objectStore("pia");
      pia.add({
        name: name, author_name: author_name, evaluator_name: evaluator_name, validator_name: validator_name,
        creation_date: creation_date, last_open_date: new Date(), status: 1
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async updatePia(id, name, author_name, evaluator_name, validator_name) {
    this.piaDb = await this.initPiaDb();
    const pia: IDBObjectStore = this.piaDb.transaction(this.piaTableName, "readwrite").objectStore(this.piaTableName);
    pia.get(id).onsuccess = (event: any) => {
      const result = event.target.result
      result.name = name;
      result.author_name = author_name;
      result.evaluator_name = evaluator_name;
      result.validator_name = validator_name;
      pia.put(result);
    };
  }

  async deletePia(id) {
    this.piaDb = await this.initPiaDb();
    return new Promise((resolve, reject) => {
      const pia: IDBObjectStore = this.piaDb.transaction(this.piaTableName, "readwrite").objectStore("pia");
      pia.delete(id);
    });
  }

}
