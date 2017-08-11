import { ApplicationDb } from '../application.db';


export class Pia extends ApplicationDb {
  public id: number;
  public status: number; // 0: doing, 1: refused, 2: simple_validation, 3: signed_validation
  public name: string;
  public author_name: string;
  public evaluator_name: string;
  public validator_name: string;
  public dpo_status: number; // 0: NOK, 1: OK
  public dpo_opinion: string;
  public concerned_people_opinion: string;
  public concerned_people_status: number; // 0: NOK, 1: OK
  public rejected_reason: string;
  public applied_adjustements: string;
  public dpos_names: string;
  public people_names: string;

  constructor() {
    super(201707071818, 'pia');
    this.created_at = new Date();
  }

  async create() {
    if (this.created_at === undefined) {
      this.created_at = new Date();
    }
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.add({
        name: this.name,
        author_name: this.author_name,
        evaluator_name: this.evaluator_name,
        validator_name: this.validator_name,
        dpo_status: this.dpo_status,
        dpo_opinion: this.dpo_opinion,
        concerned_people_opinion: this.concerned_people_opinion,
        concerned_people_status: this.concerned_people_status,
        rejected_reason: this.rejected_reason,
        applied_adjustements: this.applied_adjustements,
        created_at: this.created_at,
        status: 0,
        dpos_names: this.dpos_names,
        people_names: this.people_names
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async update() {
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.name = this.name;
        entry.author_name = this.author_name;
        entry.evaluator_name = this.evaluator_name;
        entry.validator_name = this.validator_name;
        entry.dpo_status = this.dpo_status;
        entry.dpo_opinion = this.dpo_opinion;
        entry.concerned_people_opinion = this.concerned_people_opinion;
        entry.concerned_people_status = this.concerned_people_status;
        entry.rejected_reason = this.rejected_reason;
        entry.applied_adjustements = this.applied_adjustements;
        entry.status = this.status;
        entry.dpos_names = this.dpos_names;
        entry.people_names = this.people_names;
        entry.updated_at = new Date();
        this.objectStore.put(entry).onsuccess = () => {
          resolve();
        };
      });
    });
  }

  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        if (entry) {
          this.status = entry.status;
          this.name = entry.name;
          this.author_name = entry.author_name;
          this.evaluator_name = entry.evaluator_name;
          this.validator_name = entry.validator_name;
          this.dpo_status = entry.dpo_status;
          this.dpo_opinion = entry.dpo_opinion;
          this.concerned_people_opinion = entry.concerned_people_opinion;
          this.concerned_people_status = entry.concerned_people_status;
          this.rejected_reason = entry.rejected_reason;
          this.applied_adjustements = entry.applied_adjustements;
          this.created_at = new Date(entry.created_at);
          this.updated_at = new Date(entry.updated_at);
          this.dpos_names = entry.dpos_names;
          this.people_names = entry.people_names;
        }
        resolve();
      });
    });
  }

  getStatusName() {
    switch (this.status) {
      case 0:
      {
        return 'En cours d\'édition';
      }
      case 1:
      {
        return 'Refusé';
      }
      case 2:
      {
        return 'Validation simple';
      }
      case 3:
      {
        return 'Validation';
      }
    }
  }
  getOpinionsStatus(status: number) {
    if (status ) {
      switch (status) {
        case 0:
        {
          return 'Le traitement ne devrait pas être mis en oeuvre.';
        }
        case 1:
        {
          return 'Le traitement devrait être mis en oeuvre.';
        }
      }
    }
  }

  getGaugeName(value: number) {
    if (value === 1) {
      return 'Négligeable';
    } else if (value === 2) {
      return 'Limitée';
    } else if (value === 3) {
      return 'Importante';
    } else if (value === 4) {
      return 'Maximale';
    }
  }
}



